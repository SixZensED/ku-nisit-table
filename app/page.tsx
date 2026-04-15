import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const hasAuth =
    Boolean(cookieStore.get("ku_access_token")?.value) &&
    Boolean(cookieStore.get("ku_student_id")?.value);

  if (hasAuth) {
    redirect("/schedule");
  }

  redirect("/auth/login");
}
