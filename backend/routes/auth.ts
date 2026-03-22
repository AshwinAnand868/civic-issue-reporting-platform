// backend/routes/auth.ts

import bcrypt from "bcryptjs";
import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import Admin from "../models/Admin";
import User from "../models/User";

const router = express.Router();

// Multer storage in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Use multer middleware
router.post(
  "/register",
  upload.single("voice_sample"), // <--- attach multer middleware here
  async (req, res) => {
    try {
      // Now req.body will contain your text fields
      const { name, email, phone, password, address, role, department_id } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Validate department_id if role is admin
      if (role === "admin" && !department_id) {
        return res.status(400).json({ error: "Admin must have a department_id" });
      }

      let voice_sample: Buffer | undefined;
      let voice_sample_mime: string | undefined;

      if (req.file) {
        voice_sample = req.file.buffer;
        voice_sample_mime = req.file.mimetype;
        console.log("Heey");
      }

      console.log(voice_sample);
      console.log(voice_sample_mime);

      const newUser = await User.create({
        name,
        email,
        phone,
        address,
        role: role || "citizen",
        department_id: role === "admin" ? department_id : undefined,
        password_hash: hashedPassword,
        voice_sample,
        voice_sample_mime,
      });

      await newUser.save();

      const user = await User.findById(newUser._id);
      if (user?.voice_sample) {
        console.log(user.voice_sample);
        console.log(user.voice_sample.length);
      }


      res.status(201).json({
        message: "Registration successful!",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          department_id: newUser.department_id || null,
        },
      });
    } catch (error: any) {
      console.error("Full Registration Error:", error);
      res.status(500).json({ error: error.message || "Server error during registration" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: "Invalid email or password." });

    // compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password." });

    // generate JWT token (optional)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    // return user info + token
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    }); 
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("In admin route");

    try {
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials or user not found in Admin registry." });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
          return res.status(401).json({ error: "Invalid email or password." });

        const token = jwt.sign(
            { id: user._id, role: "admin", department_id: user.department_id }, 
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        return res.json({ 
            token, 
            user: { 
                id: user._id, 
                role: "admin", 
                name: user.name, 
                email: user.email, 
                department_id: user.department_id 
            } 
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.status(500).json({ error: "Server Error during admin login." });
    }
});

import axios from "axios";
import FormData from "form-data";

// --- VOICE LOGIN ROUTE (/api/auth/voice-login) ---
router.post(
  "/voice-login",
  upload.single("voice_sample"),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email || !req.file) {
        return res
          .status(400)
          .json({ error: "Email and voice sample are required." });
      }

      // 1. Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "No user found with this email." });
      }

      // 2. Ensure user has a stored voice sample
      if (!user.voice_sample || !user.voice_sample_mime) {
        return res
          .status(400)
          .json({ error: "User has not registered a voice sample." });
      }

      // The python service URL
      const pythonServiceUrl = process.env.VOICE_SERVICE_URL || "http://127.0.0.1:8001";

      // 3. Send both audio files to the Python voice-service /verify-speaker/
      const formData = new FormData();

      // file1 = stored voice sample (from DB)
      formData.append("file1", user.voice_sample, {
        filename: `stored_sample.${user.voice_sample_mime?.split("/")[1] || "webm"}`,
        contentType: user.voice_sample_mime,
      });

      // file2 = live recording (from request)
      formData.append("file2", req.file.buffer, {
        filename: "login_sample.webm",
        contentType: req.file.mimetype,
      });

      const verifyRes = await axios.post(
        `${pythonServiceUrl}/verify-speaker/`,
        formData,
        { headers: formData.getHeaders() }
      );

      const { similarity_score, verified, replay_detection, error: pythonError } = verifyRes.data;

      if (pythonError) {
        throw new Error(`Python Service: ${pythonError}`);
      }

      console.log(`Voice Login attempt for ${email} - Score: ${similarity_score}, Verified: ${verified}, Replay: ${replay_detection?.is_replay}`);

      if (!verified) {
        return res
          .status(401)
          .json({ 
            error: replay_detection?.is_replay 
              ? "Replay attack detected. Please speak live."
              : "Voice authentication failed. Audio does not match." 
          });
      }

      // 6. Generate JWT token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      // Return user info and token
      res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (err: any) {
      console.error("Voice Login error:", err.response?.data || err.message);
      res.status(500).json({ error: "Server error during voice login." });
    }
  }
);

// --- DEBUG ROUTE ---
router.get("/debug-voice", async (req: Request, res: Response) => {
  const url = process.env.VOICE_SERVICE_URL || "http://127.0.0.1:8001";
  try {
    const health = await axios.get(url, { timeout: 2000 });
    res.json({ url, status: "OK", pythonResponse: health.data });
  } catch (err: any) {
    res.json({ url, status: "FAIL", error: err.message });
  }
});

export default router;