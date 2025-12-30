import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { verifyToken } from "@/utils/auth";
import { sendNotification } from "@/lib/notify";  // optional but recommended

export async function POST(req, context) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;  // 🔥 FIX HERE
    const { message } = await req.json();

    if (!message) return NextResponse.json({ message: "Comment required" }, { status: 400 });

    const ticket = await Ticket.findById(id);
    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    // Save comment
    ticket.comments.push({ user: user.id, message });
    await ticket.save();

    // 🔔 Notify ticket owner if someone else comments
    if (ticket.createdBy.toString() !== user.id) {
      await sendNotification({
        userId: ticket.createdBy,
        message: `New comment on ticket "${ticket.title}"`,
        link: `/tickets/${id}`
      });
    }

    return NextResponse.json({ message: "Comment added successfully" }, { status: 200 });

  } catch (error) {
    console.log("Comment Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
