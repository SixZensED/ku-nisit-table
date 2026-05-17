"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLoginForm } from "../../../hooks/use-login-form";
import { NotificationModal } from "../../ui/notification-modal";

const CREATOR_GITHUB_URL = "https://github.com/SixZensED";
const PROJECT_ISSUES_URL = "https://github.com/SixZensED/ku-nisit-table/issues";

export function LoginModal({ sessionExpired = false }: { sessionExpired?: boolean }) {
  const router = useRouter();
  const successHideTimerRef = useRef<number | null>(null);
  const redirectTimerRef = useRef<number | null>(null);
  const [successVisible, setSuccessVisible] = useState(false);
  const {
    form,
    showPassword,
    isSubmitting,
    submitError,
    handleInputChange,
    togglePassword,
    handleSubmit,
    clearSubmitError,
  } = useLoginForm({
    onSuccess: () => {
      if (successHideTimerRef.current !== null) {
        window.clearTimeout(successHideTimerRef.current);
      }

      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
      }

      setSuccessVisible(true);

      successHideTimerRef.current = window.setTimeout(() => {
        setSuccessVisible(false);
      }, 900);

      redirectTimerRef.current = window.setTimeout(() => {
        router.push("/schedule");
      }, 1200);
    },
  });

  useEffect(() => {
    return () => {
      if (successHideTimerRef.current !== null) {
        window.clearTimeout(successHideTimerRef.current);
        successHideTimerRef.current = null;
      }

      if (redirectTimerRef.current !== null) {
        window.clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []);

  return (
    <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-[#4fbf42]/40 bg-white/98 shadow-[0_24px_70px_-28px_rgba(0,0,0,0.35)] backdrop-blur-sm">
      <div className="p-7 sm:p-8">
        <NotificationModal
          open={successVisible}
          variant="success"
          title="เข้าสู่ระบบสำเร็จ"
          message="กำลังพาไปยังหน้าตารางเรียนของคุณ..."
          actionLabel="กำลังไปต่อ..."
          onAction={() => undefined}
          actionDisabled
        />

        <NotificationModal
          open={Boolean(submitError)}
          variant="error"
          title="เข้าสู่ระบบไม่สำเร็จ"
          message={submitError || "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง"}
          actionLabel="ปิดหน้าต่าง"
          onAction={clearSubmitError}
        />

          {sessionExpired && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div>
                <p className="font-semibold leading-tight">Session หมดอายุ</p>
                <p className="mt-0.5 text-amber-700">กรุณาเข้าสู่ระบบใหม่อีกครั้ง</p>
              </div>
            </div>
          )}

          <div className="mb-6 space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#000000]">
              ล็อคอินเข้าสู่ระบบ
            </h1>
            <p className="text-sm leading-6 text-[#000000]/75">
              เข้าสู่ระบบเพื่อดูตารางเรียนของคุณ
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#000000]">รหัสนิสิตของคุณ</span>
              <input
                className="h-12 w-full rounded-xl border border-[#4fbf42]/40 bg-[#4fbf42]/10 px-4 text-[#1f7d27] placeholder:text-[#2f9e33]/45 outline-none transition focus:border-[#4fbf42] focus:bg-white focus:ring-4 focus:ring-[#4fbf42]/20"
                type="text"
                name="studentId"
                value={form.studentId}
                onChange={handleInputChange}
                placeholder="bxxxxxxxxx"
                autoComplete="username"
                required
              />
            </label>

            <label className="block space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#000000]">รหัสผ่าน</span>
                <button
                  type="button"
                  className="text-xs font-semibold text-[#000000] hover:text-[#1f7d27]"
                  onClick={togglePassword}
                >
                  {showPassword ? "ซ่อน" : "แสดง"}
                </button>
              </div>
              <input
                className="h-12 w-full rounded-xl border border-[#4fbf42]/40 bg-[#4fbf42]/10 px-4 text-[#1f7d27] placeholder:text-[#2f9e33]/45 outline-none transition focus:border-[#4fbf42] focus:bg-white focus:ring-4 focus:ring-[#4fbf42]/20"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="กรอกรหัสผ่าน"
                autoComplete="current-password"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting || successVisible}
              className="mt-2 h-14 w-full rounded-full bg-gradient-to-b from-[#4fbf42] via-[#2f9e33] to-[#1f7d27] text-xl font-bold italic text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.16),0_4px_0_#16591f,0_8px_14px_rgba(16,88,36,0.24)] transition hover:brightness-105 active:translate-y-[1px] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),inset_0_-1px_0_rgba(0,0,0,0.18),0_2px_0_#16591f,0_5px_10px_rgba(16,88,36,0.2)]"
            >
              {isSubmitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

        <footer data-nosnippet className="mt-6 rounded-xl bg-gradient-to-r from-[#2f9e33] to-[#1f7d27] px-4 py-3 text-xs leading-relaxed text-white">
            <p className="font-medium tracking-tight text-[14px]">
              นี่คือ <span className="text-amber-300">เว็บไซต์ไม่เป็นทางการ</span> ของ KU Nisit Table
            </p>
            <p className="mt-1.5 text-[13px] text-white/90">
              KU Nisit Table เป็นเครื่องมือช่วยวางแผนตารางเรียนสำหรับนิสิต
              โดยอ้างอิงข้อมูลจาก{" "}
              <a
                href="https://my.ku.th/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-white/95 underline decoration-white/50 underline-offset-2 hover:decoration-white"
              >
                https://my.ku.th/
              </a>
            </p>
            <p className="mt-2 text-[13px] text-white/90">
              จัดทำขึ้นเพื่ออำนวยความสะดวกเท่านั้น และไม่มีเจตนาดึงข้อมูลส่วนตัวของผู้ใช้งาน
            </p>

            <div className="mt-4 rounded-lg border border-white/20 bg-white/10 px-3 py-3">
              <p className="text-[13px] font-semibold text-white">พบปัญหาการใช้งาน?</p>
              <p className="mt-1 text-[12px] text-white/85">
                แจ้งปัญหาได้ผ่าน GitHub Issues หรือเข้าดูโปรไฟล์ผู้สร้างได้จากลิงก์ด้านล่าง
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <a
                  href={PROJECT_ISSUES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-[#14532d] transition hover:bg-white"
                >
                  แจ้งปัญหา (Issues)
                </a>
                <a
                  href={CREATOR_GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/35 px-2.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-white/10"
                  aria-label="GitHub ผู้สร้าง"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M12 1C5.924 1 1 5.925 1 12.002c0 4.863 3.152 8.989 7.523 10.445.55.102.75-.239.75-.532 0-.262-.01-.958-.015-1.88-3.06.665-3.706-1.474-3.706-1.474-.5-1.272-1.222-1.61-1.222-1.61-.999-.683.076-.669.076-.669 1.104.078 1.684 1.134 1.684 1.134.981 1.68 2.574 1.194 3.201.913.1-.711.384-1.194.698-1.469-2.442-.278-5.01-1.222-5.01-5.44 0-1.202.43-2.185 1.134-2.955-.114-.278-.491-1.397.108-2.913 0 0 .924-.296 3.025 1.129A10.49 10.49 0 0 1 12 6.322c.928.004 1.862.126 2.736.37 2.099-1.425 3.022-1.13 3.022-1.13.6 1.517.224 2.636.11 2.914.706.77 1.133 1.753 1.133 2.955 0 4.228-2.572 5.16-5.022 5.434.394.34.746 1.01.746 2.037 0 1.471-.013 2.657-.013 3.018 0 .296.198.64.756.531A11.006 11.006 0 0 0 23 12.002C23 5.925 18.075 1 12 1Z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>
        </footer>

        <div className="flex justify-center gap-4 pt-4 pb-5 text-[11px] text-neutral-400">
          <Link href="/privacy-policy" className="hover:text-emerald-700 transition">Privacy Policy</Link>
          <span>·</span>
          <Link href="/disclaimer" className="hover:text-emerald-700 transition">Disclaimer</Link>
          <span>·</span>
          <Link href="/terms" className="hover:text-emerald-700 transition">Terms of Use</Link>
        </div>
      </div>
    </section>
  );
}