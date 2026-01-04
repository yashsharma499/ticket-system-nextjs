import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/utils/sendEmail";
import { ticketUpdateSchema } from "@/lib/validations/ticketUpdateSchema";

/* ====================== GET SINGLE TICKET ====================== */
export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const ticket = await Ticket.findById(id)
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role");

    if (!ticket)
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (error) {
    console.log("GET Ticket Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ====================== UPDATE TICKET ====================== */
export async function PATCH(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const parse = ticketUpdateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: parse.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const before = await Ticket.findById(id);
    if (!before)
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    // Agent cannot assign agent
    if (parse.data.assignedTo && user.role !== "admin")
      return NextResponse.json(
        { message: "Only admin can assign agents" },
        { status: 403 }
      );

    // Auto resolved timestamp
    if (parse.data.status === "Resolved" && !before.resolvedAt) {
      parse.data.resolvedAt = new Date();
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id,
      parse.data,
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    /* ========== Notifications + Emails ========== */

    if (parse.data.assignedTo && parse.data.assignedTo !== before.assignedTo?.toString()) {
      await sendNotification({
        userId: parse.data.assignedTo,
        message: `You have been assigned "${before.title}"`,
        link: `/tickets/${id}`,
      });

      try {
        const agent = await User.findById(parse.data.assignedTo);
        await sendEmail({
          to: agent.email,
          subject: "New Ticket Assigned",
          html: `<p>${before.title}</p>`,
        });
      } catch {}
    }

    if (parse.data.status && parse.data.status !== before.status) {
      await sendNotification({
        userId: before.createdBy,
        message: `Ticket status → ${parse.data.status}`,
        link: `/tickets/${id}`,
      });
    }

    if (parse.data.priority && parse.data.priority !== before.priority) {
      await sendNotification({
        userId: before.createdBy,
        message: `Priority updated → ${parse.data.priority}`,
        link: `/tickets/${id}`,
      });
    }

    return NextResponse.json(
      { message: "Updated successfully", ticket: updatedTicket },
      { status: 200 }
    );
  } catch (error) {
    console.log("PATCH Ticket Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

/* ====================== DELETE TICKET (ADMIN ONLY) ====================== */
export async function DELETE(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;


    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const ticket = await Ticket.findById(id);
    if (!ticket)
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    await Ticket.findByIdAndDelete(id);

    // Notify ticket creator
    await sendNotification({
      userId: ticket.createdBy,
      message: `Your ticket "${ticket.title}" was deleted by admin`,
      link: "/tickets",
    });

    try {
      const creator = await User.findById(ticket.createdBy);
      await sendEmail({
        to: creator.email,
        subject: "Ticket Deleted",
        html: `<p>Your ticket <b>${ticket.title}</b> was deleted by admin.</p>`,
      });
    } catch {}

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log("DELETE Ticket Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
