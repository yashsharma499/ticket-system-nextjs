import Notification from "@/models/Notification";
import User from "@/models/User";
import nodemailer from "nodemailer";

export async function sendNotification({ userId, message, link = "/" }) {
  try {
    
    await Notification.create({ userId, message, link });
    console.log("📩 Notification stored:", message);

    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠ Email skipped: SMTP credentials not set.");
      return;
    }

    
    const user = await User.findById(userId);
    if (!user?.email) return console.log("⚠ User email missing, cannot send email.");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: `"Support Desk" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Ticket Notification",
      html: `
        <p>${message}</p>
        <p><a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}${link}">
          View Ticket
        </a></p>
      `,
    });

    console.log("📨 Email sent to:", user.email);

  } catch (err) {
    console.log("❌ Notification Error:", err.message);
  }
}
