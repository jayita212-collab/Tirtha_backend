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

    // 🔥 LIMIT INPUT (very important)
    const trimmedText = inputText.slice(0, 300);

    // 🔥 TIMEOUT CONTROL
   

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization: Bearer ${process.env.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}" // 🔑 replace
        },
        body: JSON.stringify({
          inputs: trimmedText,
          parameters: {
            max_length: 60
          }
        }),
        
      }
    );

  

    const data = await response.json();
    console.log("📦 API RESPONSE:", data);

    // ✅ SUCCESS
    if (Array.isArray(data) && data[0]?.summary_text) {
      return res.json({ summary: data[0].summary_text });
    }

    // ⏳ MODEL LOADING
    if (data.error && data.error.includes("loading")) {
      return res.json({
        summary: "⏳ Model is loading... try again in 20 seconds."
      });
    }

    // ❌ OTHER ERRORS
    if (data.error) {
      return res.json({ error: data.error });
    }

    return res.json({ error: "Unknown AI response" });

  } catch (err) {
    console.log("❌ ERROR:", err);

    if (err.name === "AbortError") {
      return res.json({
        error: "⏳ AI took too long. Try shorter text."
      });
    }

    return res.json({ error: "Server crashed" });
  }
});

// ✅ SAME PORT (as you wanted)
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
