import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req) {
  try {
    const { text } = await req.json(); // << must match frontend "text"
    const apiKey = process.env.GROQ_API_KEY;

    // 🔥 If API key missing → fallback instant response
    if (!apiKey) {
      return NextResponse.json({
        reply: `AI Disabled → Suggested Response:\n\nThanks for your message. We are checking this issue and will update you soon.`
      });
    }

    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",     // recommended stable groq model
      messages: [
        {
          role: "system",
          content: `You are a support agent. Write helpful, short replies.
Ask clarifying questions if details are missing. Keep tone polite.`
        },
        {
          role: "user",
          content: `Ticket Issue:\n${text}\n\nGenerate a professional response to the customer.`
        }
      ],
      temperature: 0.4, // less randomness = more professionalism
      max_tokens: 200
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.log("AI Reply Error:", err);
    return NextResponse.json({
      reply: "Thanks for reporting this issue. Our team is reviewing it and will update you shortly." // fallback
    });
  }
}
