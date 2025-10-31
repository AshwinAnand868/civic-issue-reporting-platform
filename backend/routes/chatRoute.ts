// routes/chatRoute.ts
import express, { Request, Response } from "express";
import { askGemini } from "../ChatBot";

const router = express.Router();

router.post("/chat", async (req: Request, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const reply = await askGemini(
    `You are JanBol, a civic issue reporting assistant. 
    Help the user with their concern: ${message}`
  );

  res.json({ reply });
});

export default router;
