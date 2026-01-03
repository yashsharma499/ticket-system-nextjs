import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { rateLimit } from "@/lib/rateLimit";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.ip ||
    "unknown";

  const token = req.cookies.get("token")?.value;
  const user = token ? verifyToken(token) : null;

  // -------- RATE LIMIT ----------
  const key = user ? `${ip}:${user.id}` : ip;
  if (!rateLimit(key)) {
    return new NextResponse(
      JSON.stringify({ message: "Too many requests" }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // -------- PUBLIC ROUTES --------
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return NextResponse.next();
  }

  // -------- AUTH CHECK ----------
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // -------- ROLE CHECK ----------
  if (pathname.startsWith("/admin") && user.role !== "admin") {
    return NextResponse.redirect(new URL("/tickets", req.url));
  }

  if (pathname.startsWith("/agent") && user.role !== "agent") {
    return NextResponse.redirect(new URL("/tickets", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/tickets/:path*"],
  runtime: "nodejs",
};
