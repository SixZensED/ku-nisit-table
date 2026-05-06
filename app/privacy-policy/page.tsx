import type { Metadata } from "next";
import { PolicyLayout } from "@/components/features/policy/policy-layout";

export const metadata: Metadata = {
  title: "นโยบายความเป็นส่วนตัว",
  description: "นโยบายความเป็นส่วนตัวของ KU Nisit Table — ข้อมูลที่เก็บและไม่เก็บ",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      title="นโยบายความเป็นส่วนตัว"
      lastUpdated="อัปเดตล่าสุด: พฤษภาคม 2568"
      links={[
        { href: "/disclaimer", label: "Disclaimer" },
        { href: "/terms", label: "Terms of Use" },
      ]}
    >
      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>1. ข้อมูลที่ไม่ได้เก็บ</h2>
        <ul className="space-y-3 pl-4">
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span><strong>รหัสผ่าน</strong> — KU Nisit Table ไม่มีการเก็บหรือบันทึก Password ของคุณไว้ในระบบใดทั้งสิ้น การเข้าสู่ระบบเกิดขึ้นผ่าน API ของมหาวิทยาลัยโดยตรง</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span><strong>ข้อมูลส่วนตัว</strong> — ชื่อ นามสกุล รหัสนิสิต และข้อมูลตารางเรียน ไม่ถูกบันทึกลงฐานข้อมูลของเรา</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span><strong>ประวัติการใช้งาน</strong> — ไม่มีการเก็บ log หรือติดตามพฤติกรรมการใช้งาน</span></li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>2. ข้อมูลที่ใช้ชั่วคราว (Session)</h2>
        <p className="mb-4">เพื่อให้คุณเข้าถึงตารางเรียนได้ ระบบจะเก็บ <strong>Token การยืนยันตัวตน</strong> ไว้ใน Cookie ของเบราว์เซอร์ชั่วคราว โดย:</p>
        <ul className="space-y-3 pl-4">
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>Token มีอายุสั้น และถูกลบออกเมื่อคุณออกจากระบบหรือปิดหน้าต่างเบราว์เซอร์</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>Token ถูกส่งกลับไปยังระบบของมหาวิทยาลัยเพื่อดึงข้อมูลตารางเรียนเท่านั้น ไม่ได้นำไปใช้งานอื่น</span></li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>3. แหล่งที่มาของข้อมูล</h2>
        <p>ข้อมูลตารางเรียนทั้งหมดดึงมาจาก <strong>API ของระบบ my.ku.th</strong> โดยตรง KU Nisit Table ทำหน้าที่เพียงแสดงผลข้อมูลในรูปแบบที่อ่านง่ายขึ้น ไม่ได้แก้ไขหรือสร้างข้อมูลใหม่</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>4. บุคคลที่สาม</h2>
        <p>เว็บไซต์นี้ไม่แชร์ข้อมูลของคุณให้กับบุคคลหรือองค์กรภายนอกใด ๆ</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>5. การเปลี่ยนแปลงนโยบาย</h2>
        <p>หากมีการเปลี่ยนแปลงนโยบายฉบับนี้อย่างมีนัยสำคัญ จะมีการแจ้งให้ทราบบนหน้าเว็บไซต์</p>
      </section>
    </PolicyLayout>
  );
}
