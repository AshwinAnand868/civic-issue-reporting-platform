import express, { Request, Response } from "express";
import { askGemini } from "../ChatBot";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }

    const aiResponse = await askGemini(message);
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
