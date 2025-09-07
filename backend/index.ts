import cors from "cors";
import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import connectDB from "./config/db";
import Issue from "./models/Issue";
import User from "./models/User";

dotenv.config();
connectDB();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 API is running...");
});

app.post("/test-user", async (request: Request, response: Response) => {
    try {
        const user = await User.create({
            name: "Test User",
            email: "test@gmail.com",
            password_hash: "hashedpassword123",
            role: "citizen",
        });

        response.status(200).json(user);
    } catch(error) {
        response.status(500).json({error});
    }
});

app.post("/test-issue", async (req: Request, res: Response) => {
  try {
    const issue = await Issue.create({
      title: "Broken Streetlight",
      description: "Streetlight not working near Main St",
      category: "Streetlight",
      user_id: "68bd3ce12692f5a5f5233db9",
      location: {
        type: "Point",
        coordinates: [77.5946, 12.9716], // lng, lat
      },
    });

    res.status(201).json(issue);
  } catch (error) {
    res.status(500).json({ error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
