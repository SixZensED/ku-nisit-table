import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const KU_BASE_URL =
  process.env.KU_BASE_URL?.trim().replace(/\/+$/, "") || "https://my.ku.th";
const KU_GROUP_COURSE_URL =
  process.env.KU_GROUP_COURSE_URL?.trim() ||
  `${KU_BASE_URL}/myku/api/std-profile/getGroupCourse`;
const KU_ORIGIN = process.env.KU_ORIGIN?.trim() || KU_BASE_URL;
const KU_REFERER = process.env.KU_REFERER?.trim() || `${KU_BASE_URL}/`;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ku_access_token")?.value?.trim();
  const studentId = cookieStore.get("ku_student_id")?.value?.trim();
  const appKey = process.env.KU_APP_KEY?.trim();

  // Auth diagnostics
  const authDiag = {
    hasAppKey: !!appKey,
    appKeyPrefix: appKey ? appKey.slice(0, 6) + "..." : null,
    hasAccessToken: !!accessToken,
    accessTokenPrefix: accessToken ? accessToken.slice(0, 12) + "..." : null,
    hasStudentId: !!studentId,
    studentId: studentId ?? null,
  };

  if (!accessToken || !studentId || !appKey) {
    return NextResponse.json({
      ok: false,
      stage: "auth",
      error: "Missing auth credentials",
      authDiag,
    });
  }

  // Get year/semester from query params or use defaults
  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const semesterParam = url.searchParams.get("semester");

  const currentDate = new Date();
  const currentAcademicYear = currentDate.getFullYear() + 543;
  const currentMonth = currentDate.getMonth() + 1;
  const defaultYear =
    currentMonth >= 5 ? currentAcademicYear : currentAcademicYear - 1;
  const defaultSemester = currentMonth >= 5 && currentMonth <= 10 ? 1 : 2;

  const year = yearParam ? Number(yearParam) : defaultYear;
  const semester = semesterParam ? Number(semesterParam) : defaultSemester;

  const fetchUrl = new URL(KU_GROUP_COURSE_URL);
  fetchUrl.searchParams.set("academicYear", String(year));
  fetchUrl.searchParams.set("semester", String(semester));
  fetchUrl.searchParams.set("stdId", studentId);
  fetchUrl.searchParams.set("_ts", String(Date.now()));

  let httpStatus: number | null = null;
  let rawText: string | null = null;
  let parsed: unknown = null;
  let parseError: string | null = null;

  try {
    const response = await fetch(fetchUrl.toString(), {
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

    httpStatus = response.status;
    rawText = await response.text();

    try {
      parsed = JSON.parse(rawText);
    } catch (e) {
      parseError = String(e);
    }

    return NextResponse.json({
      ok: response.ok,
      stage: "fetch",
      authDiag,
      params: { year, semester },
      fetchUrl: fetchUrl.toString().replace(studentId, "b**********"),
      httpStatus,
      rawTextSnippet: rawText?.slice(0, 2000),
      rawTextLength: rawText?.length,
      parsed: parsed ?? null,
      parseError,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      stage: "network",
      authDiag,
      params: { year, semester },
      fetchUrl: fetchUrl.toString().replace(studentId, "b**********"),
      error: error instanceof Error ? error.message : String(error),
      httpStatus,
      rawTextSnippet: rawText?.slice(0, 500),
    });
  }
}
