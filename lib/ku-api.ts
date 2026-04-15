import { cookies } from "next/headers";

const KU_BASE_URL =
  process.env.KU_BASE_URL?.trim().replace(/\/+$/, "") || "https://my.ku.th";
const KU_GROUP_COURSE_URL =
  process.env.KU_GROUP_COURSE_URL?.trim() ||
  `${KU_BASE_URL}/myku/api/std-profile/getGroupCourse`;
const KU_PUBLIC_CBP_URL =
  process.env.KU_PUBLIC_CBP_URL?.trim() ||
  `${KU_BASE_URL}/myku/api/common/publicCBP`;
const KU_ORIGIN = process.env.KU_ORIGIN?.trim() || KU_BASE_URL;
const KU_REFERER = process.env.KU_REFERER?.trim() || `${KU_BASE_URL}/`;

export type KuGroupCourseOptions = {
  academicYear: number;
  semester: number;
};

type KuAuthContext = {
  appKey: string;
  accessToken: string;
  studentId: string;
};

async function getKuAuthContext(): Promise<KuAuthContext> {
  const appKey = process.env.KU_APP_KEY?.trim();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ku_access_token")?.value?.trim();
  const studentId = cookieStore.get("ku_student_id")?.value?.trim();

  if (!appKey) {
    throw new Error("KU_APP_KEY is not configured");
  }

  if (!accessToken) {
    throw new Error("Missing login token");
  }

  if (!studentId) {
    throw new Error("Missing student id");
  }

  return { appKey, accessToken, studentId };
}

export async function triggerKuProfileResync() {
  const { appKey, accessToken, studentId } = await getKuAuthContext();

  const response = await fetch(KU_PUBLIC_CBP_URL, {
    method: "POST",
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,th-TH;q=0.8,th;q=0.7",
      "app-key": appKey,
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache",
      expires: "0",
      "content-type": "application/json",
      "x-access-token": accessToken,
      origin: KU_ORIGIN,
      referer: KU_REFERER,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
    body: JSON.stringify({
      keys: [["gcd", studentId]],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to call KU publicCBP resync");
  }

  return true;
}

export async function fetchKuGroupCourse({
  academicYear,
  semester,
}: KuGroupCourseOptions) {
  const { appKey, accessToken, studentId } = await getKuAuthContext();

  const url = new URL(KU_GROUP_COURSE_URL);
  url.searchParams.set("academicYear", String(academicYear));
  url.searchParams.set("semester", String(semester));
  url.searchParams.set("stdId", studentId);
  url.searchParams.set("_ts", String(Date.now()));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9,th-TH;q=0.8,th;q=0.7",
      "app-key": appKey,
      "cache-control": "no-cache, no-store, max-age=0",
      pragma: "no-cache",
      expires: "0",
      "x-access-token": accessToken,
      origin: KU_ORIGIN,
      referer: KU_REFERER,
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error("Failed to fetch group course data");
  }

  return data;
}
