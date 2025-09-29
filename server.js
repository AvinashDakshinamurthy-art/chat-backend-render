import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/genai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Make sure you set GEMINI_API_KEY in Render Environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "No prompt provided" });

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ reply: text });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to get response from Gemini" });
  }
});

// Render assigns PORT; default to 3000 for local dev
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
