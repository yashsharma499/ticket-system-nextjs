import { NextResponse } from "next/server";
import { sendEmail } from "@/utils/sendEmail";

export async function GET() {
  try {
    await sendEmail({
      to: "test@mailtrap.io",        // or your mailtrap inbox email
      subject: "Ticket Hub Email Test ✔",
      html: `<h2>Email working 🚀</h2><p>Mailtrap integration successful.</p>`
    });

    return NextResponse.json({ success: true, message: "Email Sent" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

