const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 GLOBAL MEMORY
let chatHistory = [
  {
    role: "system",
    content:
      "You are a personal AI tutor. Explain step-by-step, use simple language, and give examples when needed."
  }
];

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is working");
});

// 🤖 AI ROUTE WITH MEMORY
app.post("/summarize", async (req, res) => {
  try {
    const inputText = req.body.text;

    if (!inputText) {
      return res.json({ error: "No input text provided" });
    }

    console.log("📩 User:", inputText);

    // 👉 Add user message
    chatHistory.push({
      role: "user",
      content: `User input:\n${inputText.slice(0, 500)}`
    });

    // 🔥 LIMIT MEMORY (VERY IMPORTANT)
    if (chatHistory.length > 12) {
      chatHistory.splice(1, 2); // keep system, remove oldest
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3-8b-instruct",
          messages: chatHistory,
          max_tokens: 200,
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.log("❌ API ERROR:", err);
      return res.json({ error: "AI request failed" });
    }

    const data = await response.json();

    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.json({ error: "AI failed to respond" });
    }

    // 👉 Save AI response
    chatHistory.push({
      role: "assistant",
      content: reply
    });

    console.log("🤖 AI:", reply);

    return res.json({ summary: reply });

  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    return res.json({ error: "Server crashed" });
  }
});

// 🔄 RESET MEMORY ROUTE
app.post("/reset", (req, res) => {
  chatHistory = [
    {
      role: "system",
      content:
        "You are a personal AI tutor. Explain step-by-step, use simple language, and give examples when needed."
    }
  ];

  res.json({ message: "Memory cleared" });
});

// ✅ PORT (Render compatible)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
