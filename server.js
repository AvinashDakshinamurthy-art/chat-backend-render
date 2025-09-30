import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const ELEVEN_KEY = process.env.ELEVEN_API_KEY;
const AGENT_ID = process.env.ELEVEN_AGENT_ID;
const VOICE_ID = process.env.ELEVEN_VOICE_ID; // optional

if (!ELEVEN_KEY) {
  console.error("❌ ELEVEN_API_KEY is missing!");
}
if (!AGENT_ID) {
  console.error("❌ ELEVEN_AGENT_ID is missing!");
}

app.post("/ask", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided" });
  }

  try {
    // 1️⃣ Ask ElevenLabs Agent AI for a text reply
    const agentResp = await fetch(
      `https://api.elevenlabs.io/v1/agents/${AGENT_ID}/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": ELEVEN_KEY,
        },
        body: JSON.stringify({ prompt }),
      }
    );

    const agentJson = await agentResp.json();
    const replyText =
      agentJson.response?.text || agentJson.reply || "Sorry, no reply from agent.";

    // 2️⃣ Convert to speech if VOICE_ID is set
    let audioUrl = null;
    if (VOICE_ID) {
      const ttsResp = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": ELEVEN_KEY,
          },
          body: JSON.stringify({
            text: replyText,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        }
      );

      if (ttsResp.ok) {
        const buffer = Buffer.from(await ttsResp.arrayBuffer());
        audioUrl = `data:audio/mpeg;base64,${buffer.toString("base64")}`;
      } else {
        console.warn("⚠️ TTS request failed:", await ttsResp.text());
      }
    }

    res.json({ reply: replyText, audioUrl });
  } catch (err) {
    console.error("ElevenLabs Agent error:", err);
    res.status(500).json({ reply: `Error: ${err.message}` });
  }
});

// Render will set process.env.PORT
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
});
