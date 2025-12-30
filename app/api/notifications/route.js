import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyToken } from "@/utils/auth";

// GET Notifications
export async function GET(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const user = verifyToken(token);

  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const list = await Notification.find({ userId: user._id || user.id })
    .sort({ createdAt: -1 });

  return NextResponse.json({ notifications: list }, { status: 200 });
}


// MARK ALL READ
export async function POST(req) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  const user = verifyToken(token);

  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await Notification.updateMany(
    { userId: user._id || user.id },
    { $set: { read:true } }
  );

  return NextResponse.json({ message:"All notifications marked as read" }, { status:200 });
}

