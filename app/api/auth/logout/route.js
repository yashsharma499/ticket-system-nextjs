import { NextResponse } from "next/server";

export async function POST() {
  try {
    const res = NextResponse.json({ message: "Logged out successfully" });

    // Clear ACCESS token
    res.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    // Clear REFRESH token
    res.cookies.set("refreshToken", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });

    return res;
  } catch (error) {
    console.error("Logout Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
