import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { text } = await req.json();

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: "Return only one category name: Technical, Billing, Account, General, Other." },
        { role: "user", content: text }
      ]
    });

    return NextResponse.json({ category: completion.choices[0].message.content.trim() });
  }
  catch {
    return NextResponse.json({ category: "General" }); // fallback
  }
}

