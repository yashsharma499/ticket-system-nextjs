import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { getCache, setCache } from "@/lib/cache";

export async function GET() {
  try {
    const CACHE_KEY = "agents_list";

    // ---------- CACHE HIT ----------
    const cached = getCache(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ agents: cached }, { status: 200 });
    }

    // ---------- CACHE MISS ----------
    await connectDB();

    const agents = await User.find({ role: "agent" })
      .select("name email");

    // ⏱️ Cache for 5 minutes
    setCache(CACHE_KEY, agents, 300);

    return NextResponse.json({ agents }, { status: 200 });

  } catch (err) {
    console.log("Agents Fetch Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

