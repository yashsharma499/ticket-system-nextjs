import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function PATCH(req, { params }) {
  await connectDB();
  const { id } = params;

  await Notification.findByIdAndUpdate(id, { read: true });
  return NextResponse.json({ success:true });
}
