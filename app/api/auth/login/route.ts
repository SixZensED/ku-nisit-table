import { constants, publicEncrypt } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const KU_BASE_URL =
  process.env.KU_BASE_URL?.trim().replace(/\/+$/, "") || "https://my.ku.th";
const KU_LOGIN_URL =
  process.env.KU_LOGIN_URL?.trim() || `${KU_BASE_URL}/myku/api/v2/user-login/login`;
const KU_ORIGIN = process.env.KU_ORIGIN?.trim() || KU_BASE_URL;
const KU_REFERER = process.env.KU_REFERER?.trim() || `${KU_BASE_URL}/`;
const LOGIN_TIMEOUT_MS = 8000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 8;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const ipRateLimitStore = new Map<string, RateLimitEntry>();

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "X-Content-Type-Options": "nosniff",
  };
}

function normalizePublicKey(rawKey: string) {
  return rawKey.includes("\\n") ? rawKey.replace(/\\n/g, "\n") : rawKey;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = ipRateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    ipRateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  current.count += 1;
  ipRateLimitStore.set(ip, current);

  return current.count > MAX_LOGIN_ATTEMPTS;
}

function rsaEncrypt(plainText: string, rawPublicKey: string) {
  const key = normalizePublicKey(rawPublicKey);
  return publicEncrypt(
    {
      key,
      padding: constants.RSA_PKCS1_OAEP_PADDING,
    },
    Buffer.from(plainText, "utf8"),
  ).toString("base64");
}

function invalidRequest(message: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      message,
    },
    {
      status,
      headers: noStoreHeaders(),
    },
  );
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return invalidRequest("พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง", 429);
  }

  let payload: { studentId?: string; password?: string };

  try {
    payload = (await request.json()) as { studentId?: string; password?: string };
  } catch {
    return invalidRequest("รูปแบบข้อมูลไม่ถูกต้อง");
  }

  const studentId = payload.studentId?.trim() || "";
  const password = payload.password || "";

  const isStudentIdValid = /^b\d{10}$/i.test(studentId);
  const isPasswordValid = password.length >= 4 && password.length <= 128;

  if (!isStudentIdValid || !isPasswordValid) {
    return invalidRequest("ข้อมูลเข้าสู่ระบบไม่ถูกต้อง", 422);
  }

  const appKey = process.env.KU_APP_KEY?.trim();
  const publicKey = process.env.KU_PUBLIC_KEY?.trim();

  if (!appKey || !publicKey) {
    const missing: string[] = [];
    if (!appKey) {
      missing.push("KU_APP_KEY");
    }
    if (!publicKey) {
      missing.push("KU_PUBLIC_KEY");
    }

    const message =
      process.env.NODE_ENV === "development"
        ? `เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าระบบเข้าสู่ระบบ (${missing.join(", ")})`
        : "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่าระบบเข้าสู่ระบบ";

    return invalidRequest(message, 500);
  }

  const encryptedBody = {
    username: rsaEncrypt(studentId, publicKey),
    password: rsaEncrypt(password, publicKey),
  };

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), LOGIN_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(KU_LOGIN_URL, {
      method: "POST",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,th-TH;q=0.8,th;q=0.7",
        "app-key": appKey,
        "content-type": "application/json",
        origin: KU_ORIGIN,
        referer: KU_REFERER,
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(encryptedBody),
      cache: "no-store",
      signal: abortController.signal,
    });

    const upstreamData = (await upstreamResponse.json().catch(() => null)) as
      | {
          accesstoken?: string;
          refreshToken?: string;
          user?: {
            loginName?: string;
            student?: {
              stdId?: string;
              loginName?: string;
            };
          };
        }
      | null;

    if (!upstreamResponse.ok || !upstreamData?.accesstoken) {
      return invalidRequest("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบรหัสนิสิตหรือรหัสผ่าน", 401);
    }

    const upstreamStudentId =
      upstreamData.user?.student?.stdId?.trim() || upstreamData.user?.student?.loginName?.trim();

    if (!upstreamStudentId) {
      return invalidRequest("ไม่พบรหัสนิสิตจากระบบเข้าสู่ระบบ", 502);
    }

    const response = NextResponse.json(
      {
        ok: true,
        message: "เข้าสู่ระบบสำเร็จ",
      },
      {
        status: 200,
        headers: noStoreHeaders(),
      },
    );

    response.cookies.set("ku_access_token", upstreamData.accesstoken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    response.cookies.set("ku_student_id", upstreamStudentId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch {
    return invalidRequest("ไม่สามารถเชื่อมต่อระบบเข้าสู่ระบบได้ในขณะนี้", 502);
  } finally {
    clearTimeout(timeoutId);
  }
}
