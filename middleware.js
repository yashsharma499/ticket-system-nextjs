import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { rateLimit } from "@/lib/rateLimit";

export function middleware(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.ip ||
    "unknown";

  const cookie = req.cookies.get("token");
  const token = cookie?.value;
  const { pathname } = req.nextUrl;

  let user = null;

  if (token) {
    user = verifyToken(token);
  }

  // ---------------- RATE LIMITING ----------------
  const rateLimitKey = user
    ? `${ip}:${user.id}` // authenticated
    : ip;               // unauthenticated

  const allowed = rateLimit(rateLimitKey);

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ message: "Too many requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  // ------------------------------------------------

  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.some(r => pathname.startsWith(r)) || pathname === "/") {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

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
