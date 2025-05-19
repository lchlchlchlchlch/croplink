import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  const res = await fetch(`${baseUrl}/api/auth/get-session`, {
    method: "GET",
    headers: {
      Cookie: request.headers.get("cookie") || "", // Forward the cookies from the request
    },
  });

  const session = await res.json();

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session.user.role === "user") {
    return NextResponse.redirect(new URL("/signup/pick-role", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/farmer", "/buyer", "/admin"],
};
