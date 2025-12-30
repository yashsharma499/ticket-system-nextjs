// lib/ai.js

export async function runAI(prompt, type = "reply") {
  const apiKey = process.env.GROQ_API_KEY;   // using GROQ instead of OpenAI
  const isEnabled = process.env.AI_ENABLED === "true";

  /* ================== Fallback if AI Disabled or No Key ================== */
  if (!apiKey || !isEnabled) {
    return mockAI(prompt, type); // fallback response
  }

  /* ================== GROQ AI REQUEST ================== */
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",  // best lightweight model for support AI
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || mockAI(prompt, type);

  } catch (err) {
    console.error("AI Error → Using Mock:", err);
    return mockAI(prompt, type);
  }
}

/* ======================================================================== */
/*                               MOCK FALLBACK                              */
/* ======================================================================== */
function mockAI(prompt, type) {
  switch (type) {
    case "summary":
      return "Mock Summary: This ticket describes an issue requiring support. (AI disabled)";
    case "classify":
      return "General"; // default category mock
    case "reply":
      return "Thank you for contacting support. We are reviewing your issue."; 
    default:
      return "Mock AI Response";
  }
}

/* ======================================================================== */
/*                     Prebuilt Self-Use Helper Functions                   */
/* ======================================================================== */

export async function aiSummarize(text) {
  return runAI(`Summarize this ticket in one short paragraph:\n${text}`, "summary");
}

export async function aiClassify(text) {
  return runAI(`Categorize this ticket (General/Billing/Technical/Account/Other):\n${text}`, "classify");
}

export async function aiReply(message) {
  return runAI(`Write a helpful support reply for:\n${message}`, "reply");
}
