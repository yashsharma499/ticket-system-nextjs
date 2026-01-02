import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import { verifyToken } from "@/utils/auth";
import { getCache, setCache } from "@/lib/cache";

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user || user.role !== "agent") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 🔑 Cache per agent
    const cacheKey = `agent_tickets:${user.id}`;

    // ---------- CACHE HIT ----------
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ tickets: cached }, { status: 200 });
    }

    // ---------- CACHE MISS ----------
    await connectDB();

    const tickets = await Ticket.find({ assignedTo: user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // ⏱️ Short TTL (data changes often)
    setCache(cacheKey, tickets, 30);

    return NextResponse.json({ tickets }, { status: 200 });

  } catch (error) {
    console.log("Agent Ticket Fetch Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
