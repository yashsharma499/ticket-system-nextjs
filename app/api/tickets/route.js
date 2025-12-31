import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/utils/sendEmail";
import { ticketSchema } from "@/lib/validations/ticketSchema";

export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const parse = ticketSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parse.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      category,
      priority,
      attachments = [],
    } = parse.data;

    // Create ticket
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: user.id,
      attachments,
    });

    await sendNotification({
      userId: user.id,
      message: `Your ticket "${title}" has been created.`,
      link: `/tickets/${ticket._id}`,
    });

    try {
      const userData = await User.findById(user.id);

      await sendEmail({
        to: userData.email,
        subject: `Ticket Created: ${title}`,
        html: `
          <h2>🎫 Ticket Created Successfully</h2>
          <p><strong>${title}</strong></p>
          <p>${description}</p>
          <p>We will update you when an agent is assigned.</p><br/>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/tickets/${ticket._id}" 
             style="padding:10px 14px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
            View Ticket →
          </a>
        `,
      });
    } catch (emailErr) {
      console.log("📩 Email failed but ticket created:", emailErr.message);
    }

    return NextResponse.json(
      { message: "Ticket created successfully", ticket },
      { status: 201 }
    );
  } catch (error) {
    console.log("Create Ticket Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const {
      search,
      status,
      priority,
      assignedTo,
      createdBy,
      page = 1,
      limit = 10,
    } = Object.fromEntries(req.nextUrl.searchParams);

    const query = {};

    if (user.role === "agent") query.assignedTo = user.id;
    if (user.role === "customer") query.createdBy = user.id;

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo && user.role === "admin") query.assignedTo = assignedTo;
    if (createdBy && user.role === "admin") query.createdBy = createdBy;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const totalCount = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    return NextResponse.json({
      tickets,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.log("Fetch Tickets Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
