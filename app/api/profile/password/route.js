import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const userData = verifyToken(token);
  if(!userData) return NextResponse.json({message:"Unauthorized"}, {status:401});

  const { oldPass, newPass } = await req.json();
  const user = await User.findById(userData.id);

  const match = await bcrypt.compare(oldPass, user.password);
  if(!match) return NextResponse.json({message:"Old password incorrect"}, {status:400});

  user.password = await bcrypt.hash(newPass, 10);
  await user.save();

  return NextResponse.json({ message: "Password changed successfully" });
}
