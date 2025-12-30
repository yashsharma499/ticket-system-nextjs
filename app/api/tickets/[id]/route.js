import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Ticket from "@/models/Ticket";
import User from "@/models/User";
import { verifyToken } from "@/utils/auth";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/utils/sendEmail";
import { ticketUpdateSchema } from "@/lib/validations/ticketUpdateSchema"; // Zod Validation


/* ====================== GET A SINGLE TICKET ====================== */
export async function GET(req, context) {
  try {
    await connectDB();
    const { id } = await context.params; // ✔ Correct way in App Router

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



/* ================== UPDATE TICKET (Zod Validation) ================== */
export async function PATCH(req, context) {
  try {
    await connectDB();
    const { id } = await context.params; // ✔ Fixed

    // Auth Check
    const token = req.cookies.get("token")?.value;
    const user = verifyToken(token);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // ----------- ZOD Validation -----------
    const parse = ticketUpdateSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: parse.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const before = await Ticket.findById(id);
    if (!before)
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    // Only admin can assign agent
    if (parse.data.assignedTo && user.role !== "admin")
      return NextResponse.json({ message: "Only admin can assign agents" }, { status: 403 });

    // Apply update
    const updatedTicket = await Ticket.findByIdAndUpdate(id, parse.data, { new: true })
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");


    /* =====================================================
       🔔 EVENT TRIGGERS - Notification + Email Based on Change
       ===================================================== */

    /** 1️⃣ New Agent Assigned */
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
          subject: `New Ticket Assigned`,
          html: `<h2>🎫 New Assignment</h2><p>You are assigned to <b>${before.title}</b>.</p>`
        });
      } catch (e) { console.log("Email(assign) failed:", e.message); }
    }


    /** 2️⃣ Status Changed */
    if (parse.data.status && parse.data.status !== before.status) {
      await sendNotification({
        userId: before.createdBy,
        message: `Ticket "${before.title}" status updated → ${parse.data.status}`,
        link: `/tickets/${id}`,
      });

      try {
        const creator = await User.findById(before.createdBy);
        await sendEmail({
          to: creator.email,
          subject: `Ticket Status Updated`,
          html: `<p>Your ticket <b>${before.title}</b> is now <b>${parse.data.status}</b></p>`
        });
      } catch (e) { console.log("Email(status) failed:", e.message); }
    }


    /** 3️⃣ Priority Changed */
    if (parse.data.priority && parse.data.priority !== before.priority) {
      await sendNotification({
        userId: before.createdBy,
        message: `Priority updated → ${parse.data.priority}`,
        link: `/tickets/${id}`,
      });

      try {
        const creator = await User.findById(before.createdBy);
        await sendEmail({
          to: creator.email,
          subject: `Ticket Priority Updated`,
          html: `<p>Priority changed to <b>${parse.data.priority}</b></p>`
        });
      } catch (e) { console.log("Email(priority) failed:", e.message); }
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

