// backend/routes/auth.ts

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User"; 
import Admin from "../models/Admin"; 
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
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

    const newUser = new User({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      address,
      role: role || "citizen",
      department_id: role === "admin" ? department_id : undefined,
    });

    await newUser.save();

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
});

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

// --- 1. ADMIN LOGIN ROUTE (/api/auth/admin/login) ---
router.post("/admin/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Attempt to find user ONLY in the Admin collection
        const user = await Admin.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials or user not found in Admin registry." });
        }

        // 1. Password Verification (REPLACE MOCK WITH REAL LOGIC)
        if (password !== 'adminpass') return res.status(401).json({ error: "Invalid credentials" }); // MOCK

        // 2. Generate JWT Token (Role is implicitly 'admin')
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