// backend/routes/users.ts
import express from "express";
import { authMiddleware } from "../middleware/auth"; // if you have auth
import User from "../models/User";

const router = express.Router();

// Get user details
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean(); // lean() returns plain object
    if (!user) return res.status(404).json({ error: "User not found" });

    // Convert Buffer to base64 for easy frontend use
    let voice_base64: string | null = null;
    if (user.voice_sample) {
      const base64 = user.voice_sample.toString("base64");
      voice_base64 = `data:${user.voice_sample_mime};base64,${base64}`;
    }

    res.json({
      ...user,
      voice_base64, // add this to frontend response
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
