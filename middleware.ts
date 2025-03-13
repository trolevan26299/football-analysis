import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const isKTV = token?.role === "ktv";

    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isKTVRoute = req.nextUrl.pathname.startsWith("/ktv");

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    if (isKTVRoute && !isKTV) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/ktv/:path*"],
};
