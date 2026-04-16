export default async function handler(req, res) {
  
  // ==============================
  // ✅ CORS SETUP (IMPORTANT FIX)
  // ==============================
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    // Validate input
    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    // Check API key
    if (!API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY in environment variables",
      });
    }

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `
You are a smart AI tutor for teens in an EdTech platform.

Rules:
- Explain simply and clearly
- Use step-by-step teaching
- Give examples when needed
- Be friendly and encouraging

User question:
${message}
                `,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    // Debug log (Vercel logs)
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    // Handle API failure
    if (!response.ok) {
      return res.status(500).json({
        error: "Gemini API request failed",
        details: data,
      });
    }

    // Extract AI response safely
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        error: "No response generated from Gemini",
        raw: data,
      });
    }

    // Success response
    return res.status(200).json({ reply });

  } catch (error) {
    console.error("AI SERVER ERROR:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}