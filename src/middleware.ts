import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const TOKEN_KEY = "redsync_jwt";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(TOKEN_KEY)?.value || req.headers.get("authorization")?.replace("Bearer ", "");
    // If no token in cookies/headers, redirect to login
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};


