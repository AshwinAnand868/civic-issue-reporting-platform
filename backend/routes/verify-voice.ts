// backend/routes/verify-voice.ts

import axios from "axios";
import express, { Request, Response } from "express";
import FormData from "form-data";
import multer from "multer";
import { authMiddleware } from "../middleware/auth";
import User from "../models/User";

const router = express.Router();

// Multer storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * POST /api/auth/verify-voice
 * Biometric speaker verification for issue reporting.
 * Compares the live recording against the user's stored voice sample
 * using the Python voice-service (ECAPA-TDNN embeddings + cosine similarity).
 * Also performs replay attack detection on the live recording.
 */
router.post(
  "/verify-voice",
  authMiddleware,
  upload.single("voice_sample"),
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Voice sample is required for verification." });
      }

      // 1. Fetch the user's stored voice sample
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }

      if (!user.voice_sample || !user.voice_sample_mime) {
        return res.status(400).json({
          error:
            "No stored voice sample found. Please register your voice first.",
        });
      }

      // 2. Send both audio files to the Python voice-service /verify-speaker/
      const pythonServiceUrl =
        process.env.VOICE_SERVICE_URL || "http://127.0.0.1:8001";

      const formData = new FormData();

      // file1 = stored voice sample (from DB)
      formData.append("file1", user.voice_sample, {
        filename: `stored_sample.${user.voice_sample_mime?.split("/")[1] || "webm"}`,
        contentType: user.voice_sample_mime,
      });

      // file2 = live recording (from request)
      formData.append("file2", req.file.buffer, {
        filename: "live_sample.webm",
        contentType: req.file.mimetype,
      });

      const verifyRes = await axios.post(
        `${pythonServiceUrl}/verify-speaker/`,
        formData,
        { headers: formData.getHeaders() }
      );

      const { similarity_score, verified, replay_detection } = verifyRes.data;

      console.log(
        `Voice Verification for user ${req.user.id}: Score=${similarity_score}, Verified=${verified}, Replay=${JSON.stringify(replay_detection)}`
      );

      // 3. Return the result
      res.json({
        verified,
        similarity_score,
        replay_detection,
        message: !verified
          ? replay_detection?.is_replay
            ? "Replay attack detected. Please speak live into the microphone."
            : "Voice verification failed. Your voice does not match the registered sample."
          : "Voice verified successfully!",
      });
    } catch (err: any) {
      console.error("Voice verification error:", err.response?.data || err.message);
      res.status(500).json({
        error: "Server error during voice verification.",
      });
    }
  }
);

export default router;
