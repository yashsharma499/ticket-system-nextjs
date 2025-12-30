import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { authRegisterSchema } from "@/lib/validations/authRegisterSchema"; // ⬅ Zod

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = authRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

    const userExists = await User.findOne({ email });
    if (userExists) return NextResponse.json({ message: "Email already exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (err) {
    console.log("Register Error:", err);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
