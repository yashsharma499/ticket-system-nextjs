import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null });

  const userData = verifyToken(token);
  const user = await User.findById(userData.id).select("name role email");

  return NextResponse.json({ user });
}
