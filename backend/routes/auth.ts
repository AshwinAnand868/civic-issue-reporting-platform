// backend/routes/auth.ts

import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
// --- NEW IMPORTS ---
import Citizen from "../models/User"; 
import Admin from "../models/Admin"; 
// -------------------

const router = express.Router();

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

// --- 2. CITIZEN LOGIN ROUTE (Standard /api/auth/login) ---
router.post("/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        // Attempt to find user ONLY in the Citizen collection
        const user = await Citizen.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials or user not found." });
        }
        
        // MOCK PASSWORD CHECK (REMOVE THIS LINE IN PRODUCTION)
        if (password !== 'citizenpass') return res.status(401).json({ error: "Invalid credentials" });

        // 2. Generate JWT Token (Role is implicitly 'citizen')
        const token = jwt.sign(
            { id: user._id, role: "citizen" }, 
            process.env.JWT_SECRET as string, 
            { expiresIn: '1d' }
        );

        return res.json({ 
            token, 
            user: { 
                id: user._id, 
                role: "citizen", 
                name: user.name, 
                email: user.email 
            } 
        });

    } catch (error) {
        console.error("Citizen Login Error:", error);
        return res.status(500).json({ error: "Server Error during citizen login." });
    }
});

export default router;