const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get("/", (req, res) => {
  res.send("✅ Backend is working");
});

// ✅ Summarize route
app.post("/summarize", async (req, res) => {
  try {
    const inputText = req.body.text;

    if (!inputText) {
      return res.json({ error: "No input text provided" });
    }

    console.log("📩 Request received");

    const trimmedText = inputText.slice(0, 300);

    // 🔥 OPENROUTER API (FIXED ONLY THIS PART)
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY }` // ✅ FIXED
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct", // ✅ FREE MODEL
          messages: [
            {
              role: "user",
              content: `Summarize this text:\n\n${trimmedText}`
            }
          ],
          max_tokens: 120
        })
      }
    );

    const data = await response.json();
    console.log("📦 API RESPONSE:", data);

    // ✅ SUCCESS (UPDATED RESPONSE FORMAT)
    if (data.choices && data.choices[0]) {
      return res.json({
        summary: data.choices[0].message.content
      });
    }

    // ❌ ERROR
    if (data.error) {
      return res.json({ error: data.error.message || "API error" });
    }

    return res.json({ error: "Unknown AI response" });

  } catch (err) {
    console.log("❌ ERROR:", err);

    return res.json({ error: "Server crashed" });
  }
});

// ✅ SAME PORT
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
