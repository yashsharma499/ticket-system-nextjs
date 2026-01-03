import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { verifyToken } from "@/utils/auth";

export async function PATCH(req, { params }) {
  await connectDB();

  const token = req.cookies.get("token")?.value;
  if (!token)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = verifyToken(token);
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = params;

  // Mark only user's own notification
  const updated = await Notification.findOneAndUpdate(
    { _id: id, userId: user.id },
    { $set: { read: true } },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json(
      { message: "Notification not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
