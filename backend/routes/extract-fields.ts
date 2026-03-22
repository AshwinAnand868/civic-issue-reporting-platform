// backend/routes/extract-fields.ts

import axios from "axios";
import { Buffer } from "buffer";
import express, { Request, Response } from "express";
import { askGemini } from "../ChatBot";
import { authMiddleware } from "../middleware/auth";

const router = express.Router();

const ASSEMBLY_API_KEY = process.env.ASSEMBLYAI_API_KEY;

// Upload audio buffer to AssemblyAI
async function uploadToAssembly(fileBuffer: Buffer) {
  const uploadResponse = await axios.post(
    "https://api.assemblyai.com/v2/upload",
    fileBuffer,
    {
      headers: {
        authorization: ASSEMBLY_API_KEY,
        "transfer-encoding": "chunked",
      },
    }
  );
  return uploadResponse.data.upload_url;
}

// Poll AssemblyAI until transcription is complete
async function pollUntilReady(transcriptId: string): Promise<string> {
  while (true) {
    const res = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: { authorization: ASSEMBLY_API_KEY },
      }
    );

    if (res.data.status === "completed") {
      return res.data.text || "";
    } else if (res.data.status === "error") {
      throw new Error(`Transcription error: ${res.data.error}`);
    }

    // Wait 2 seconds before polling again
    await new Promise((r) => setTimeout(r, 2000));
  }
}

/**
 * POST /api/transcribe/extract-fields
 *
 * Accepts either:
 *   - audio_base64 + audio_mime (voice input → transcribe first)
 *   - text (typed description → skip transcription)
 *
 * Uses Gemini to extract structured fields from the text:
 *   title, description, category, priority
 */
router.post("/extract-fields", authMiddleware, async (req: Request, res: Response) => {
  try {
    let complaintText = "";

    const { audio_base64, audio_mime, text } = req.body;

    if (text) {
      // Text-only mode (user typed the description)
      complaintText = text;
    } else if (audio_base64 && audio_mime) {
      // Voice mode: transcribe first
      const base64Data = audio_base64.replace(
        /^data:[a-z]+\/[a-z]+;base64,/,
        ""
      );
      const audioBuffer = Buffer.from(base64Data, "base64");

      console.log("📤 Uploading audio to AssemblyAI for field extraction...");
      const assemblyUrl = await uploadToAssembly(audioBuffer);

      const transcriptRes = await axios.post(
        "https://api.assemblyai.com/v2/transcript",
        { audio_url: assemblyUrl },
        { headers: { authorization: ASSEMBLY_API_KEY } }
      );

      const transcriptId = transcriptRes.data.id;
      console.log(`📝 Polling transcription ${transcriptId}...`);
      complaintText = await pollUntilReady(transcriptId);

      if (!complaintText || complaintText.trim() === "") {
        return res.status(400).json({
          error: "Could not transcribe the audio. Please try speaking clearly.",
        });
      }
    } else {
      return res.status(400).json({
        error: "Either 'text' or 'audio_base64'+'audio_mime' is required.",
      });
    }

    console.log(`🧠 Extracting fields from: "${complaintText}"`);

    // Use Gemini to extract structured fields
    const extractionPrompt = `
You are an AI assistant for a civic issue reporting platform.

Given the following citizen complaint text, extract structured fields from it.
Respond ONLY with valid JSON (no markdown, no explanation). Use this exact format:

{
  "title": "A short title summarizing the issue (max 10 words)",
  "description": "A detailed and complete description of the issue as described by the citizen. DO NOT truncate important details.",
{
  "title": "A short summarizing title (max 10 words)",
  "description": "A detailed and complete description of the issue. DO NOT truncate important details.",
  "category": "A single word or short phrase representing the category of the issue (e.g., Waste, Roads, Water, Parks, Stray Animals, Cyber, etc.)",
  "priority": "One of: Low, Medium, High"
}

Rules:
- For "category": Identify the most relevant civic department or category for this issue. Be specific (e.g., if it's about a park, category is "Parks & Recreation").
- For "priority": If the complaint mentions danger, accidents, risk to life, or major flooding → "High". If it causes significant inconvenience → "Medium". Minor issues → "Low".
- For "title": Create a concise, clear title.
- For "description": Use the citizen's own words, cleaned up for grammar. 

Citizen complaint:
"${complaintText}"
`;

    const geminiResponse = await askGemini(extractionPrompt);

    // Parse the JSON response from Gemini
    let fields;
    try {
      fields = JSON.parse(geminiResponse);
    } catch {
      const jsonMatch = geminiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fields = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Gemini did not return valid JSON");
      }
    }

    // Validate the extracted priority
    const validPriorities = ["Low", "Medium", "High"];
    if (!validPriorities.includes(fields.priority)) {
      fields.priority = "Medium"; // default fallback
    }

    res.json({
      transcribed_text: complaintText,
      fields: {
        title: fields.title || "Civic Issue Report",
        description: fields.description || complaintText,
        category: fields.category || "General",
        priority: fields.priority,
      },
    });
  } catch (err: any) {
    console.error(
      "❌ Field extraction error:",
      err.response?.data || err.message
    );
    res.status(500).json({ error: "Failed to extract fields from complaint." });
  }
});

export default router;
