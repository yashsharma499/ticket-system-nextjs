import { NextResponse } from "next/server";
import {
  verifyRefreshToken,
  generateAccessToken,
} from "@/utils/tokens";

export async function POST(req) {
  try {
    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token" },
        { status: 401 }
      );
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // ✅ Mint NEW access token ONLY
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role, // include role if you encoded it
    });

    const res = NextResponse.json({ message: "Token refreshed" });

    // ✅ Update EXISTING cookie name
    res.cookies.set("token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    return res;
  } catch (err) {
    console.error("Refresh Token Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
