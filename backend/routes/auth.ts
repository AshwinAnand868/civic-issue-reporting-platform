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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
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

export default router;