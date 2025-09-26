// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

let aiClient = null;
try {
  // Official JS/TS SDK
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  aiClient = new GoogleGenAI({});
} catch (err) {
  console.warn("Google GenAI SDK not available:", err.message);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "ok" }));

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  // If SDK present and API key set, call Gemini
  if (aiClient && process.env.GEMINI_API_KEY) {
    try {
      // Using generateContent as in the official quickstart
      const response = await aiClient.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      // SDK usually exposes a .text() or .text property on response.
      // Try common locations for the text and fall back if needed.
      const reply =
        (response && response.text) ||
        (response && response?.candidates?.[0]?.content?.[0]?.parts?.[0]?.text) ||
        JSON.stringify(response).slice(0, 1000);

      return res.json({ reply });
    } catch (err) {
      console.error("Gemini call failed:", err);
      return res.status(500).json({ reply: "Gemini error: " + (err.message || err) });
    }
  }

  // Fallback for when Gemeni SDK/key isn't available
  return res.json({ reply: `You said: ${prompt}` });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
