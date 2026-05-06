import type { Metadata } from "next";
import { PolicyLayout } from "@/components/features/policy/policy-layout";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "KU Nisit Table เป็นโปรเจคอิสระ ไม่มีความเกี่ยวข้องกับมหาวิทยาลัยเกษตรศาสตร์",
  alternates: { canonical: "/disclaimer" },
  robots: { index: true, follow: true },
};

export default function DisclaimerPage() {
  const notice = (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-5 py-4 text-[15px] text-amber-900">
      <strong>KU Nisit Table เป็นโปรเจคอิสระที่พัฒนาโดยนิสิต</strong> ไม่ใช่บริการทางการของมหาวิทยาลัยเกษตรศาสตร์
    </div>
  );

  return (
    <PolicyLayout
      title="Disclaimer"
      lastUpdated="อัปเดตล่าสุด: พฤษภาคม 2568"
      notice={notice}
      links={[
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Use" },
      ]}
    >
      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>1. ความเป็นอิสระจากมหาวิทยาลัย</h2>
        <p>KU Nisit Table <strong>ไม่มีความเกี่ยวข้อง ไม่ได้รับการรับรอง และไม่ได้รับการสนับสนุน</strong> จากมหาวิทยาลัยเกษตรศาสตร์หรือหน่วยงานใดของมหาวิทยาลัยในทุกรูปแบบ โลโก้ ชื่อ และเครื่องหมายการค้าของมหาวิทยาลัยเกษตรศาสตร์เป็นทรัพย์สินของมหาวิทยาลัย</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>2. ความถูกต้องของข้อมูล</h2>
        <p className="mb-4">ข้อมูลตารางเรียนดึงมาจากระบบ my.ku.th โดยตรง ความถูกต้องของข้อมูลจึงขึ้นอยู่กับระบบของมหาวิทยาลัย ซึ่งอาจมีความคลาดเคลื่อนได้ในกรณีต่อไปนี้:</p>
        <ul className="space-y-3 pl-4">
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ระบบของมหาวิทยาลัยมีการปรับเปลี่ยนข้อมูลหลังจากที่ดึงข้อมูลมาแสดงผลแล้ว</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ตารางเรียนมีการเปลี่ยนแปลงกะทันหัน เช่น ยกเลิกชั่วโมงเรียน หรือเปลี่ยนห้อง</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>API ของมหาวิทยาลัยส่งข้อมูลที่ไม่สมบูรณ์</span></li>
        </ul>
        <p className="mt-4 font-medium text-amber-800">กรุณาตรวจสอบตารางเรียนอย่างเป็นทางการผ่าน my.ku.th ก่อนเสมอ</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>3. วัตถุประสงค์</h2>
        <p>โปรเจคนี้สร้างขึ้นเพื่อช่วยให้นิสิตเข้าถึงตารางเรียนได้สะดวกและรวดเร็วยิ่งขึ้น ไม่มีวัตถุประสงค์เชิงพาณิชย์</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>4. ข้อจำกัดความรับผิด</h2>
        <p>ผู้พัฒนาไม่รับผิดชอบต่อความเสียหายใด ๆ ที่อาจเกิดขึ้นจากการใช้งานเว็บไซต์นี้ รวมถึงการพลาดชั่วโมงเรียนหรือการสอบอันเนื่องมาจากข้อมูลที่ไม่ถูกต้อง</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>5. Open Source</h2>
        <p>ซอร์สโค้ดของโปรเจคนี้เป็น Open Source สามารถตรวจสอบการทำงานของระบบได้โดยตรง</p>
      </section>
    </PolicyLayout>
  );
}
