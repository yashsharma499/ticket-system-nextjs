import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function POST(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const userData = verifyToken(token);

  if(!userData) return NextResponse.json({message:"Unauthorized"}, {status:401});

  await User.findByIdAndUpdate(userData.id, { sessions: [] });

  // remove cookie for current device too
  const res = NextResponse.json({ message:"Logged out from all devices" });
  res.cookies.set("token", "", { httpOnly:true, expires:new Date(0) });

  return res;
}
