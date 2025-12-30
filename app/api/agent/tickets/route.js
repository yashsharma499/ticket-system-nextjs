import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { verifyToken } from "@/utils/auth";

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user || user.role !== "agent") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const tickets = await Ticket.find({ assignedTo: user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ tickets }, { status: 200 });

  } catch (error) {
    console.log("Agent Ticket Fetch Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
