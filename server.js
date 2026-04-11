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

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sshleifer/distilbart-cnn-12-6",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.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}` // ✅ FIXED
        },
        body: JSON.stringify({
          inputs: trimmedText,
          parameters: {
            max_length: 60
          }
        }) // ✅ comma not needed after last property
      }
    );

    const data = await response.json();
    console.log("📦 API RESPONSE:", data);

    if (Array.isArray(data) && data[0]?.summary_text) {
      return res.json({ summary: data[0].summary_text });
    }

    if (data.error && data.error.includes("loading")) {
      return res.json({
        summary: "⏳ Model is loading... try again in 20 seconds."
      });
    }

    if (data.error) {
      return res.json({ error: data.error });
    }

    return res.json({ error: "Unknown AI response" });

  } catch (err) {
    console.log("❌ ERROR:", err);

    return res.json({ error: "Server crashed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`); // ✅ FIXED
});
