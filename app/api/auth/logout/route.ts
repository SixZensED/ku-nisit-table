import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 60 * 60;
const STUDENT_ID_MAX_AGE = 60 * 60 * 24;

function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
    "X-Content-Type-Options": "nosniff",
  };
}

function clearAuthCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

function setAuthCookie(response: NextResponse, name: string, value: string, maxAge: number) {
  response.cookies.set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
    expires: new Date(Date.now() + maxAge * 1000),
  });
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ku_access_token")?.value ?? "";
  const studentId = cookieStore.get("ku_student_id")?.value ?? "";

  const mode = request.nextUrl.searchParams.get("mode") || "clear";
  const graceSecondsValue = Number(request.nextUrl.searchParams.get("seconds") || "60");
  const graceSeconds = Number.isFinite(graceSecondsValue)
    ? Math.min(300, Math.max(1, Math.floor(graceSecondsValue)))
    : 60;

  const messageByMode: Record<string, string> = {
    clear: "Logout success",
    grace: `Session will expire in ${graceSeconds} seconds`,
    refresh: "Session refreshed",
  };

  const response = NextResponse.json(
    {
      ok: true,
      message: messageByMode[mode] || "Logout success",
    },
    {
      status: 200,
      headers: noStoreHeaders(),
    },
  );

  if (mode === "refresh") {
    if (accessToken) {
      setAuthCookie(response, "ku_access_token", accessToken, ACCESS_TOKEN_MAX_AGE);
    }

    if (studentId) {
      setAuthCookie(response, "ku_student_id", studentId, STUDENT_ID_MAX_AGE);
    }

    return response;
  }

  if (mode === "grace") {
    if (accessToken) {
      setAuthCookie(response, "ku_access_token", accessToken, graceSeconds);
    } else {
      clearAuthCookie(response, "ku_access_token");
    }

    if (studentId) {
      setAuthCookie(response, "ku_student_id", studentId, graceSeconds);
    } else {
      clearAuthCookie(response, "ku_student_id");
    }

    return response;
  }

  clearAuthCookie(response, "ku_access_token");
  clearAuthCookie(response, "ku_student_id");

  return response;
}