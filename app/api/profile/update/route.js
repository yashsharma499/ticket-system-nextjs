import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";

export async function PATCH(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const userData = verifyToken(token);
  if(!userData) return NextResponse.json({message:"Unauthorized"}, {status:401});

  const { name, email } = await req.json();
  await User.findByIdAndUpdate(userData.id, { name, email });

  return NextResponse.json({ message: "Profile updated successfully" });
}
