import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { text } = await req.json();

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "Summarize the ticket in short bullet points." },
        { role: "user", content: text }
      ]
    });

    return NextResponse.json({ summary: completion.choices[0].message.content });
  }
  catch {
    return NextResponse.json({ summary: "Summary unavailable. View ticket details manually." });
  }
}
