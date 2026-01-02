import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { getCache, setCache } from "@/lib/cache";

// ================= ADMIN STATS WITH DATE FILTERS =================
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // 🔑 Cache key must include filters
    const cacheKey = `admin_stats:from=${from || "none"}:to=${to || "none"}`;

    // ---------- CACHE HIT ----------
    const cached = getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // ---------- CACHE MISS ----------
    await connectDB();

    let filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to + "T23:59:59");
    }

    // ===== Ticket Counts =====
    const total = await Ticket.countDocuments(filter);
    const open = await Ticket.countDocuments({ ...filter, status: "Open" });
    const inProgress = await Ticket.countDocuments({ ...filter, status: "In Progress" });
    const resolved = await Ticket.countDocuments({ ...filter, status: "Resolved" });
    const closed = await Ticket.countDocuments({ ...filter, status: "Closed" });

    // ===== Priority Stats =====
    const low = await Ticket.countDocuments({ ...filter, priority: "Low" });
    const medium = await Ticket.countDocuments({ ...filter, priority: "Medium" });
    const high = await Ticket.countDocuments({ ...filter, priority: "High" });
    const urgent = await Ticket.countDocuments({ ...filter, priority: "Urgent" });

    // ===== Tickets Per Agent =====
    const ticketsPerAgent = await Ticket.aggregate([
      { $match: { assignedTo: { $ne: null }, ...filter } },
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent"
        }
      },
      { $unwind: "$agent" },
      { $project: { name: "$agent.name", email: "$agent.email", count: 1 } }
    ]);

    // ===== Average Resolution Time =====
    const resolvedTickets = await Ticket.find({
      status: "Resolved",
      resolvedAt: { $exists: true },
      ...filter
    });

    let avgResolutionTime = 0;
    if (resolvedTickets.length > 0) {
      const totalHours = resolvedTickets.reduce((sum, t) => {
        const diff =
          (new Date(t.resolvedAt) - new Date(t.createdAt)) /
          (1000 * 60 * 60);
        return diff > 0 ? sum + diff : sum;
      }, 0);

      avgResolutionTime = (totalHours / resolvedTickets.length).toFixed(1);
    }

    const response = {
      total,
      statusCount: { open, inProgress, resolved, closed },
      priorityCount: { low, medium, high, urgent },
      ticketsPerAgent,
      avgResolutionTime,
      dateFilterUsed: Boolean(from || to),
    };

    // ---------- SET CACHE ----------
    setCache(cacheKey, response, 30); // ⏱️ 30 seconds TTL

    return NextResponse.json(response);

  } catch (error) {
    console.log("📌 STATS API ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
