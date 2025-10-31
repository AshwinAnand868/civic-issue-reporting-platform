import express, { Request, Response, NextFunction } from "express";

// --- IMPORTANT: Ensure these models and middleware are imported correctly ---
import { authMiddleware } from "../middleware/auth";
import Issue from "../models/Issue";


const router = express.Router();

// --- AUTHENTICATED REQUEST INTERFACE ---
// This interface MUST match the CustomPayload defined in auth.ts
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
        role: "citizen" | "admin";
        department_id?: string;
    };
}

// --- HELPER FUNCTION ---
// Safely extracts the 'name' field from a populated Mongoose object
const getName = (populatedField: any): string => {
    return populatedField && typeof populatedField === 'object' && populatedField.name ? populatedField.name : 'N/A';
};


// ====================================================================
// 1. AI AGENT TOOL ENDPOINT: GET /status/:issueId
// Executor Tool for the Agentic AI. Does not use authMiddleware.
// ====================================================================
router.get("/status/:issueId", async (req: Request, res: Response) => {
    try {
        const { issueId } = req.params;

        // Populate required fields for AI response clarity
        const issue = await Issue.findById(issueId)
            .populate("department_id", "name")
            .populate("assigned_admin_id", "name");

        if (!issue) {
            return res.status(404).json({ success: false, error: "Issue ID not found or invalid." });
        }

        // Structure the response exactly as the AI Tool expects
        return res.json({
            success: true,
            issueId: issue._id,
            status: issue.status,
            category: issue.category,
            priority: issue.priority,
            departmentName: getName(issue.department_id), // Safely access name
            assignedAdminName: getName(issue.assigned_admin_id), // Safely access name
            latestUpdate: `Last updated on ${new Date(issue.updatedAt).toLocaleDateString()}`,
        });
    } catch (error: any) {
        console.error("AI Status Check Error:", error);
        return res.status(500).json({ success: false, error: "Internal server error during lookup." });
    }
});


// ====================================================================
// 2. CREATE ISSUE: POST /
// Uses authMiddleware -> Requires casting to AuthenticatedRequest
// ====================================================================
router.post("/", authMiddleware, async (req: Request, res: Response) => {
    // FIX: Cast the request object immediately after authMiddleware runs
    const authReq = req as AuthenticatedRequest;

    try {
        const {title, description, location, category, photo_url, voice_url, department_id, priority } = authReq.body;
        
        if (!title || !description || !location || !category) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const issue = new Issue({
            title,
            description,
            location,
            category,
            photo_url,
            voice_url,
            // Accessing user data from the casted object
            department_id: authReq.user.role === "admin" ? department_id : undefined,
            priority: priority,
            user_id: authReq.user.id
        });

        await issue.save();
        res.status(201).json(issue);

    } catch (error: any) {
        console.error("Issue Creation Error:", error);
        res.status(500).json({ error: "Error while creating issue" });
    }
});


// ====================================================================
// 3. GET SINGLE ISSUE: GET /users/:userid/issues/:id
// ====================================================================
router.get("/users/:userid/issues/:id", authMiddleware, async (req: Request, res: Response) => {
    // FIX: Cast the request object
    const authReq = req as AuthenticatedRequest;
    
    try {
        const { userid, id } = authReq.params;

        // Populate all fields for the detailed dashboard view
        const issue = await Issue.findOne({ _id: id, user_id: userid })
            .populate("user_id", "name email")
            .populate("department_id", "name")
            .populate("assigned_admin_id", "name"); 

        if (!issue) return res.status(404).json({ error: "Issue not found" });

        // Authorization Check (Accessing authReq.user)
        if (authReq.user.role === "citizen" && authReq.user.id !== issue.user_id.toString()) {
            return res.status(403).json({ error: "Not authorized to view this issue" });
        }

        res.json(issue);
    } catch (error: any) {
        res.status(500).json({ error: "Server error while fetching issue details." });
    }
});


// ====================================================================
// 4. GET ALL ISSUES (DASHBOARD LIST): GET /
// ====================================================================
router.get("/", authMiddleware, async (req: Request, res: Response) => {
    // FIX: Cast the request object
    const authReq = req as AuthenticatedRequest;
    
    try {
        const role = authReq.user.role;
        let query = {};

        if (role === "admin") {
            // Admin sees issues for their department
            query = { department_id: authReq.user.department_id };
        } else {
            // Citizen sees only their own issues
            query = { user_id: authReq.user.id };
        }

        const issues = await Issue.find(query)
            .populate("user_id", "name email")
            .populate("department_id", "name")
            .populate("assigned_admin_id", "name");

        res.json(issues);
    } catch (err: any) {
        res.status(500).json({ error: "Server error while fetching issue list." });
    }
});


// ====================================================================
// 5. UPDATE STATUS / ASSIGNMENT: PATCH /:id/status
// ====================================================================
router.patch("/:id/status", authMiddleware, async (req: Request, res: Response) => {
    // FIX: Cast the request object
    const authReq = req as AuthenticatedRequest;
    
    try {
        if (authReq.user.role !== "admin") {
            return res.status(403).json({ error: "Only administrators can update status." });
        }

        const { status, priority, assigned_admin_id } = authReq.body;
        
        const updateFields: any = {};
        if (status) updateFields.status = status;
        if (priority) updateFields.priority = priority;
        if (assigned_admin_id !== undefined) updateFields.assigned_admin_id = assigned_admin_id; 

        const issue = await Issue.findByIdAndUpdate(
            authReq.params.id,
            updateFields,
            { new: true }
        );

        if (!issue) return res.status(404).json({ error: "Issue not found" });

        res.json(issue);
    } catch (err: any) {
        res.status(500).json({ error: "Server error during status update." });
    }
});

export default router;