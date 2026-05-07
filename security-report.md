# Security Report — ku-nisit-table

**วันที่ตรวจสอบ:** 7 พฤษภาคม 2026  
**ขอบเขต:** Source code ทั้งหมดในโปรเจกต์ (Next.js + TypeScript)

---

## สรุปภาพรวม

| ระดับความเสี่ยง | จำนวน |
|---|---|
| 🔴 Critical | 1 |
| 🟠 High | 2 |
| 🟡 Medium | 2 |
| 🔵 Low | 2 |
| **รวม** | **7** |

---

## 🔴 Critical

### [VULN-01] Rate Limiting ทำงานไม่ได้จริงบน Vercel (Serverless)

**ไฟล์:** `app/api/auth/login/route.ts`

**ปัญหา:**  
Rate limiting ใช้ `Map` ใน memory ของ Node.js process:

```typescript
const ipRateLimitStore = new Map<string, RateLimitEntry>();
```

บน Vercel (Serverless Functions) แต่ละ request อาจถูก handle โดย instance ที่ต่างกัน และ process จะถูก kill หลังจากไม่มีการใช้งาน ทำให้ `Map` ถูก reset ทุกครั้ง Rate limiting จึง **ไม่มีผลในการ production** ผู้ไม่ประสงค์ดีสามารถ brute-force รหัสผ่านได้ไม่จำกัด

**ผลกระทบ:** Brute-force attack บัญชี KU Nisit ของผู้ใช้

**แนวทางแก้ไข:**  
ใช้ external store เช่น Redis (Upstash Redis ที่ใช้ได้ฟรีบน Vercel) หรือ KV store:

```typescript
// ตัวอย่างใช้ Upstash Redis
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(8, "15 m"),
});
```

---

## 🟠 High

### [VULN-02] IP Spoofing — ผู้ไม่ประสงค์ดีสามารถปลอม IP เพื่อหลบ Rate Limit

**ไฟล์:** `app/api/auth/login/route.ts` บรรทัด 33–41

**ปัญหา:**  
ฟังก์ชัน `getClientIp()` อ่านค่าจาก header `x-forwarded-for` โดยตรงโดยไม่มีการตรวจสอบ:

```typescript
function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") || "unknown";
}
```

ผู้ใช้ทั่วไปสามารถแนบ header `X-Forwarded-For: 1.2.3.4` ในทุก request เพื่อปลอม IP ร่วมกับ VULN-01 ทำให้ Rate Limit ไม่มีประสิทธิภาพเลย

**ผลกระทบ:** Bypass rate limiting → Brute-force attack ได้ไม่จำกัด

**แนวทางแก้ไข:**  
บน Vercel ควรอ่าน IP จาก header ที่ Vercel inject มาเองเท่านั้น ไม่ใช่ header ที่ client ส่งมา:

```typescript
import { geolocation, ipAddress } from "@vercel/functions";

// ใช้ ipAddress() จาก @vercel/functions แทน
const ip = ipAddress(request) ?? "unknown";
```

หรือถ้าไม่ใช้ `@vercel/functions` ให้ Trust เฉพาะ IP สุดท้ายใน chain:

```typescript
// X-Forwarded-For: client, proxy1, proxy2
// ค่าที่น่าเชื่อถือคือค่าแรกสุดที่ Vercel เพิ่มเอง (ค่าสุดท้ายใน list)
const ips = forwardedFor.split(",").map(ip => ip.trim());
return ips[ips.length - 1] || "unknown";
```

---

### [VULN-03] Logout Endpoint ขาด Authentication + `mode` Parameter ถูก Abuse ได้

**ไฟล์:** `app/api/auth/logout/route.ts`

**ปัญหา:**  
Endpoint `/api/auth/logout` รับ query parameter `mode` และ `seconds` โดยไม่มีการตรวจสอบ CSRF token หรือ origin:

- `?mode=refresh` — ต่ออายุ session ของผู้ใช้คนอื่นได้ถ้าแนบ cookie ได้ (ใน same-site context)
- `?mode=grace&seconds=300` — ลด maxAge ของ cookie โดยไม่ logout จริง

แม้ `sameSite: "lax"` ช่วยป้องกันได้บางส่วน แต่ไม่ครอบคลุมทุกกรณี (เช่น top-level navigation GET → ยิง POST ตาม)

**ผลกระทบ:** Session manipulation, ต่ออายุ session โดยไม่ต้องการ

**แนวทางแก้ไข:**  
เพิ่ม CSRF token validation หรือตรวจสอบ `Origin` header:

```typescript
const origin = request.headers.get("origin");
const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com";
if (origin !== allowedOrigin) {
  return NextResponse.json({ ok: false }, { status: 403 });
}
```

---

## 🟡 Medium

### [VULN-04] ไม่มี Security Headers (CSP, X-Frame-Options ฯลฯ)

**ไฟล์:** `next.config.ts`

**ปัญหา:**  
ไม่มีการตั้งค่า HTTP Security Headers เลย ทำให้เสี่ยงต่อ:

- **Clickjacking** — ไม่มี `X-Frame-Options` หรือ `frame-ancestors`
- **XSS** — ไม่มี `Content-Security-Policy`
- **MIME sniffing** — ไม่มี `X-Content-Type-Options`

**แนวทางแก้ไข:**  
เพิ่ม headers ใน `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

---

### [VULN-05] Cookie `ku_student_id` ไม่มีการ Validate เมื่ออ่านกลับ

**ไฟล์:** `lib/ku-api.ts`

**ปัญหา:**  
เมื่อดึงค่า `studentId` จาก cookie แล้วส่งต่อเข้า URL parameter โดยตรง ไม่มีการ validate รูปแบบ:

```typescript
const studentId = cookieStore.get("ku_student_id")?.value?.trim();
// ...
url.searchParams.set("stdId", studentId);
```

แม้ cookie จะเป็น `httpOnly` แต่ถ้ามีช่องโหว่ server-side อื่น หรือ cookie ถูก set ผิดค่า อาจทำให้เกิด parameter injection ใน URL ที่ส่งไปยัง KU API ได้

**แนวทางแก้ไข:**  
เพิ่ม validation ก่อนใช้งาน:

```typescript
const studentId = cookieStore.get("ku_student_id")?.value?.trim();
if (!studentId || !/^b\d{10}$/i.test(studentId)) {
  throw new Error("Invalid student ID in session");
}
```

---

## 🔵 Low

### [VULN-06] Cookie `ku_student_id` มีอายุนานกว่า Access Token

**ไฟล์:** `app/api/auth/login/route.ts`

**ปัญหา:**  
- `ku_access_token` หมดอายุใน **1 ชั่วโมง**
- `ku_student_id` หมดอายุใน **24 ชั่วโมง**

ทำให้ในช่วงชั่วโมงที่ 1–24 มี `ku_student_id` แต่ไม่มี `ku_access_token` ซึ่งอาจทำให้หน้า `/schedule` redirect ไม่สม่ำเสมอ (เช็คเพียง `hasAuth` แบบ AND)

**แนวทางแก้ไข:**  
ให้ maxAge ของทั้งสอง cookie เท่ากัน หรือเช็ค `ku_access_token` อย่างเดียวเป็นหลัก

---

### [VULN-07] Hardcoded User-Agent เลียนแบบ Browser

**ไฟล์:** `lib/ku-api.ts`, `app/api/auth/login/route.ts`

**ปัญหา:**  
```typescript
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
```

การปลอม User-Agent อาจผิดเงื่อนไขการใช้งาน API ของ KU และหากทาง KU อัปเดต bot detection อาจทำให้แอปหยุดทำงานกะทันหัน

**แนวทางแก้ไข:**  
ตรวจสอบกับทีม KU ว่ามี API key สำหรับ third-party access หรือไม่ และใช้ User-Agent ที่สื่อถึงแอปพลิเคชัน:

```typescript
"user-agent": "ku-nisit-table/1.0 (+https://github.com/SixZensED/ku-nisit-table)"
```

---

## สรุป Priority การแก้ไข

| ลำดับ | ID | ชื่อ | ความยาก |
|---|---|---|---|
| 1 | VULN-01 | Rate Limit ด้วย Redis (แทน in-memory) | ปานกลาง |
| 2 | VULN-02 | Fix IP detection บน Vercel | ง่าย |
| 3 | VULN-04 | เพิ่ม Security Headers | ง่าย |
| 4 | VULN-05 | Validate studentId จาก cookie | ง่าย |
| 5 | VULN-03 | เพิ่ม CSRF / Origin check บน logout | ปานกลาง |
| 6 | VULN-06 | ปรับ cookie maxAge ให้ตรงกัน | ง่าย |
| 7 | VULN-07 | ปรับ User-Agent | ง่าย |

---

*รายงานนี้จัดทำโดย Claude (Anthropic) บน Cowork mode*
