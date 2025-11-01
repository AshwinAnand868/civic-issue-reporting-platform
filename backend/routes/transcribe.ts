// backend/routes/transcribe.ts
import axios from "axios";
import { Buffer } from "buffer";
import express from "express";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

// ⚠️ Use the constant for API Key consistency across all routes
const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY;

// -------------- Helper functions ------------------

// Check if the API key is set before proceeding
if (!ASSEMBLY_API_KEY) {
    console.error("ASSEMBLYAI_API_KEY is missing! Check your .env file and environment loading.");
    // Optionally throw an error or handle it gracefully
}


// Updated helper to accept a file buffer (instead of local file path)
async function uploadToAssembly(fileBuffer: Buffer) {
  const uploadResponse = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    fileBuffer,
    {
      headers: {
        // Use the constant ASSEMBLY_API_KEY
        authorization: ASSEMBLY_API_KEY, 
        "transfer-encoding": "chunked",
      },
    }
  );
  return uploadResponse.data.upload_url;
}

// --------------------------------------------------

// 🔹 Transcribe sample voice from BASE64 data
router.post("/sample-voice", authMiddleware, async (req, res) => {
  try {
    const { audio_base64, audio_mime } = req.body;
    
    if (!audio_base64 || !audio_mime) {
        return res.status(400).json({ error: "audio_base64 and audio_mime are required" });
    }

    // 1. Extract Base64 string: remove the data URI prefix
    const base64Data = audio_base64.replace(/^data:[a-z]+\/[a-z]+;base64,/, "");

    // 2. Convert Base64 string to a Buffer
    const audioBuffer = Buffer.from(base64Data, 'base64');
    
    console.log("🎧 Uploading Base64 audio to AssemblyAI...");
    const assemblyUrl = await uploadToAssembly(audioBuffer);

    console.log("📝 Creating transcript from AssemblyAI URL...");
    const transcriptResponse = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url: assemblyUrl },
      { 
        headers: { 
            // Use the constant ASSEMBLY_API_KEY
            authorization: ASSEMBLY_API_KEY 
        } 
      }
    );

    res.json({ transcriptId: transcriptResponse.data.id });
  } catch (err: any) {
    // 💡 Add better error logging to see the AssemblyAI response content
    console.error("❌ AssemblyAI API Error (Base64 Upload):", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to transcribe sample voice via Base64 upload" });
  }
});

// 🔹 Transcribe report voice from Cloudinary URL
router.post("/report-voice", authMiddleware, async (req, res) => {
  try {
    const { audio_url } = req.body;
    if (!audio_url) return res.status(400).json({ error: "audio_url is required" });

    const transcriptRes = await axios.post(
      "https://api.assemblyai.com/v2/transcript",
      { audio_url },
      { 
        headers: { 
            // Use the constant ASSEMBLY_API_KEY
            authorization: ASSEMBLY_API_KEY 
        } 
      }
    );

    res.json({ transcriptId: transcriptRes.data.id });
  } catch (err: any) {
    console.error("❌ AssemblyAI API Error (URL Transcribe):", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to transcribe report voice" });
  }
});

// 🔹 Poll transcript by ID
router.get("/:transcriptId", authMiddleware, async (req, res) => {
  try {
    const { transcriptId } = req.params;
    const response = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { 
        // Use the constant ASSEMBLY_API_KEY
        authorization: ASSEMBLY_API_KEY 
      },
    });

    res.json(response.data);
  } catch (err: any) {
    console.error("❌ AssemblyAI API Error (Polling):", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch transcription" });
  }
});

export default router;