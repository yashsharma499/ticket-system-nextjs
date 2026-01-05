import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/utils/auth";
import { generateRefreshToken } from "@/utils/tokens";
import { authLoginSchema } from "@/lib/validations/authLoginSchema";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {
  try {
    // ================= RATE LIMIT (IP ONLY) =================
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown-ip";

    if (!rateLimit(ip)) {
      return NextResponse.json(
        { message: "Too many login attempts. Try again later." },
        { status: 429 }
      );
    }
    // ========================================================

    await connectDB();

    const body = await req.json();
    const parsed = authLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    /* ================= TOKENS ================= */

    // ✅ Access Token (role normalized)
    const token = generateToken({
      id: user._id,
      role: user.role.toLowerCase(),
    });

    // ✅ Refresh Token
    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // ✅ Access Token Cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    // ✅ Refresh Token Cookie
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
