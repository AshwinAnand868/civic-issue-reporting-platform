// backend/middleware/auth.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define the custom payload expected in your JWT
interface CustomPayload extends JwtPayload {
    id: string;
    role: "citizen" | "admin";
    department_id?: string;
}

// Extend the Express Request interface globally
declare global {
    namespace Express {
        interface Request {
            user?: CustomPayload; 
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as CustomPayload;

        // Attach the decoded user data (including role and department_id) to the request
        req.user = decoded; 
        next();
    } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};