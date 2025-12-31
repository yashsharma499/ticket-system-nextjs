import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

export function middleware(req) {
  const cookie = req.cookies.get("token");
  const token = cookie?.value;
  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register"];

  if (publicRoutes.some(r => pathname.startsWith(r)) || pathname === "/") {
    return NextResponse.next();
  }

  if (!token) return NextResponse.redirect(new URL("/login", req.url));

  const user = verifyToken(token);
  

  if (!user) return NextResponse.redirect(new URL("/login", req.url));

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
  runtime: "nodejs"        
};
