// backend/index.ts

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db"; // Assuming this function exists and connects Mongoose
import authRoutes from "./routes/auth";
import issueRoutes from "./routes/issues";
// import departmentRoutes from './routes/departments'; // If you have department routes
import chatRoute from "./routes/chatRoute";
import departmentRoutes from "./routes/departments";
import transcribeRoutes from "./routes/transcribe";
import userRoutes from "./routes/user";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- Middlewares ---
app.use(cors()); // Configure CORS options as needed
app.use(express.json()); // Body parser

// --- Routes ---
app.use("/api/auth", authRoutes); // Uses the modified login routes
app.use("/api/issues", issueRoutes); // Uses the issue routes
// app.use("/api/departments", departmentRoutes);
app.use("/api/chat", chatRoute);

app.use("/api/departments", departmentRoutes);

app.use("/api/users", userRoutes);

app.use("/api/transcribe", transcribeRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// app.post("/test-user", async (request: Request, response: Response) => {
//     try {
//         const user = await User.create({
//             name: "Test User",
//             email: "test@gmail.com",
//             password_hash: "hashedpassword123",
//             role: "citizen",
//         });

//         response.status(200).json(user);
//     } catch(error) {
//         response.status(500).json({error});
//     }
// });

// app.post("/test-issue", async (req: Request, res: Response) => {
//   try {
//     const issue = await Issue.create({
//       title: "Broken Streetlight",
//       description: "Streetlight not working near Main St",
//       category: "Streetlight",
//       user_id: "68bd3ce12692f5a5f5233db9",
//       location: {
//         type: "Point",
//         coordinates: [77.5946, 12.9716], // lng, lat
//       },
//     });

//     res.status(201).json(issue);
//   } catch (error) {
//     res.status(500).json({ error });
//   }
// });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
