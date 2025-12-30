import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });

  // remove token cookie
  res.cookies.set("token", "", { maxAge: 0 });

  return res;
}
