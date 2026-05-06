import type { Metadata } from "next";
import { PolicyLayout } from "@/components/features/policy/policy-layout";

export const metadata: Metadata = {
  title: "เงื่อนไขการใช้งาน",
  description: "เงื่อนไขการใช้งาน KU Nisit Table — ข้อตกลงสำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <PolicyLayout
      title="เงื่อนไขการใช้งาน"
      lastUpdated="อัปเดตล่าสุด: พฤษภาคม 2568"
      links={[
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/disclaimer", label: "Disclaimer" },
      ]}
    >
      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>1. ผู้ใช้งาน</h2>
        <p>KU Nisit Table ออกแบบมาสำหรับ<strong>นิสิตมหาวิทยาลัยเกษตรศาสตร์</strong>ที่มีบัญชีผู้ใช้งานระบบ my.ku.th อย่างถูกต้องเท่านั้น การเข้าใช้งานโดยไม่มีสิทธิ์หรือการพยายามเข้าถึงข้อมูลของผู้อื่นเป็นสิ่งต้องห้าม</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>2. วัตถุประสงค์การใช้งาน</h2>
        <p className="mb-4">อนุญาตให้ใช้งานเพื่อ:</p>
        <ul className="mb-6 space-y-3 pl-4">
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ดูและวางแผนตารางเรียนของตนเองเท่านั้น</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>บันทึกตารางเรียนเป็นรูปภาพเพื่อใช้ส่วนตัว</span></li>
        </ul>
        <p className="mb-4">ห้ามใช้งานเพื่อ:</p>
        <ul className="space-y-3 pl-4">
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>เข้าถึงหรือดึงข้อมูลของนิสิตคนอื่น</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ทำ automated scraping หรือ bot ใด ๆ</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ใช้งานในเชิงพาณิชย์โดยไม่ได้รับอนุญาต</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>กระทำการใด ๆ ที่ผิดกฎหมายหรือละเมิดนโยบายของมหาวิทยาลัย</span></li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>3. ข้อมูลบัญชีและความปลอดภัย</h2>
        <ul className="space-y-3 pl-4">
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ห้ามแชร์บัญชีหรือ Session ของตนให้ผู้อื่นใช้งาน</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1 w-4 shrink-0 bg-neutral-300" /><span>ผู้ใช้รับผิดชอบต่อความปลอดภัยของบัญชีตนเอง</span></li>
        </ul>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>4. ความพร้อมใช้งาน</h2>
        <p>เว็บไซต์นี้ให้บริการตามสภาพที่เป็นอยู่ (as-is) ผู้พัฒนาไม่รับประกันว่าจะให้บริการได้ตลอดเวลา อาจมีการปิดปรับปรุงหรือหยุดให้บริการโดยไม่แจ้งล่วงหน้า</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>5. การเปลี่ยนแปลงเงื่อนไข</h2>
        <p>ผู้พัฒนาสงวนสิทธิ์ในการแก้ไขเงื่อนไขการใช้งานได้ตลอดเวลา การใช้งานต่อไปหลังจากมีการเปลี่ยนแปลงถือว่ายอมรับเงื่อนไขใหม่</p>
      </section>

      <section>
        <h2 className="mb-4 border-l-2 border-[#1f7d27] pl-4 text-lg font-semibold text-neutral-900" style={{ fontFamily: '"LINE Seed Sans TH", "Segoe UI", Tahoma, sans-serif' }}>6. กฎหมายที่บังคับใช้</h2>
        <p>เงื่อนไขนี้อยู่ภายใต้กฎหมายไทย รวมถึงพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) พ.ศ. 2562</p>
      </section>
    </PolicyLayout>
  );
}
