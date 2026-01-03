import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const userData = verifyToken(token);
    if (!userData || !userData.id) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = await User.findById(userData.id).select("name email role");

    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (error) {
    console.log("AUTH ME ERROR:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
