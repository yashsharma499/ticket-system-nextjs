import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { generateToken } from "@/utils/auth";
import { authLoginSchema } from "@/lib/validations/authLoginSchema"; // ⬅ Zod

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = authLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid credentials", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

    const token = generateToken({ id: user._id, role: user.role });

    user.sessions.push({ token, loginAt: new Date() });
    await user.save();

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    console.log("Login Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}