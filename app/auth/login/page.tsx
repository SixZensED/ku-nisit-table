import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginModal } from "@/components/features/auth/login-modal";
import { waitForSkeleton } from "@/lib/skeleton-delay";

export const metadata: Metadata = {
  title: "Login",
  description: "เข้าสู่ระบบ KU Nisit Table เพื่อตรวจสอบและจัดการตารางเรียนของคุณ",
  alternates: {
    canonical: "/auth/login",
  },
};

export default async function LoginPage() {
  await waitForSkeleton();

  const cookieStore = await cookies();
  const hasAuth =
    Boolean(cookieStore.get("ku_access_token")?.value) &&
    Boolean(cookieStore.get("ku_student_id")?.value);

  if (hasAuth) {
    redirect("/schedule");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />
      <LoginModal />
    </main>
  );
}
