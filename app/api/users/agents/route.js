import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const agents = await User.find({ role: "agent" }).select("name email");

    return NextResponse.json({ agents }, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
