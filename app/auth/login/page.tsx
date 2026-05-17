import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginModal } from "@/components/features/auth/login-modal";
import { waitForSkeleton } from "@/lib/skeleton-delay";

export const metadata: Metadata = {
  title: {
    absolute: "KU Nisit Table",
  },
  description: "เครื่องมือเช็คตารางเรียนและวางแผนการเรียนสำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์ (มก.) ดึงข้อมูลโดยตรงจากระบบ my.ku.th ใช้งานง่าย สะดวก รวดเร็ว",
  openGraph: {
    title: "KU Nisit Table | เช็คตารางเรียน ม.เกษตร",
    description: "เครื่องมือเช็คตารางเรียนและวางแผนการเรียนสำหรับนิสิตมหาวิทยาลัยเกษตรศาสตร์ (มก.) ดึงข้อมูลโดยตรงจากระบบ my.ku.th ใช้งานง่าย สะดวก รวดเร็ว",
    url: "/auth/login",
    images: [
      {
        url: "/image/kunisittable.png",
        width: 1200,
        height: 630,
        alt: "KU Nisit Table",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  alternates: {
    canonical: "/auth/login",
  },
};

type LoginPageProps = {
  searchParams?: Promise<{ reason?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await waitForSkeleton();

  const params = await searchParams;
  const isExpired = params?.reason === "expired";

  const cookieStore = await cookies();
  const hasAuth =
    Boolean(cookieStore.get("ku_access_token")?.value) &&
    Boolean(cookieStore.get("ku_student_id")?.value);

  // Only auto-redirect if NOT expired — expired sessions were already cleared
  if (hasAuth && !isExpired) {
    redirect("/schedule");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-green-200/25 blur-3xl" />
      <LoginModal sessionExpired={isExpired} />
    </main>
  );
}
