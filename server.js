// server.js (CommonJS - easy to run)
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors()); // allows your front-end to call the backend
app.use(express.json());

// Basic /ask endpoint
app.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });

    // If you set OPENAI_API_KEY on Render, this will try to use OpenAI.
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require("openai");
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini", // optional: change model later
          messages: [{ role: "user", content: prompt }],
          max_tokens: 500,
        });

        const reply =
          completion?.choices?.[0]?.message?.content ?? "No reply from OpenAI";
        return res.json({ reply });
      } catch (err) {
        console.error("OpenAI call failed:", err.message || err);
        // fallback reply
      }
    }

    // Fallback (works without OpenAI): simple echo reply
    res.json({ reply: `You said: ${prompt}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ reply: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
