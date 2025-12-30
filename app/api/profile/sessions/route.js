import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const userData = verifyToken(token);
  if(!userData) return NextResponse.json({message:"Unauthorized"}, {status:401});

  const user = await User.findById(userData.id).select("sessions");

  return NextResponse.json({ sessions: user.sessions });
}
