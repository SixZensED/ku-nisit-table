import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function GET(request: NextRequest) {
  const base = new URL(request.url).origin;
  const response = NextResponse.redirect(`${base}/auth/login?reason=expired`, {
    status: 302,
  });

  clearCookie(response, "ku_access_token");
  clearCookie(response, "ku_student_id");

  return response;
}
