import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import Issue from "../models/Issue";
import Notification from "../models/Notification";
import User from "../models/User";

const router = express.Router();

// --- HELPER FUNCTION ---
// Safely extracts the 'name' field from a populated Mongoose object
const getName = (populatedField: any): string => {
  return populatedField && typeof populatedField === "object" && populatedField.name
    ? populatedField.name
    : "N/A";
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
      departmentName: getName(issue.department_id),
      assignedAdminName: getName(issue.assigned_admin_id),
      latestUpdate: `Last updated on ${new Date(issue.updatedAt).toLocaleDateString()}`,
    });
  } catch (error: any) {
    console.error("AI Status Check Error:", error);
    return res.status(500).json({ success: false, error: "Internal server error during lookup." });
  }
});

// ====================================================================
// 2. CREATE ISSUE (Authenticated)
// ====================================================================
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, description, location, category, photo_url, voice_url, department_id, priority } =
      req.body;

    const issue = new Issue({
      title,
      description,
      location,
      category,
      photo_url,
      voice_url,
      department_id,
      priority,
      user_id: req.user.id,
    });

    await issue.save();

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await Notification.create({
      message: `Your issue "${issue.title}" has been submitted successfully.`,
      type: "Email",
      user_id: req.user.id,
      issue_id: issue._id,
    });

    res.status(201).json({ message: "Issue submitted and notification sent", issue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error while creating issue" });
  }
});

// ====================================================================
// 3. GET SPECIFIC ISSUE FOR USER
// ====================================================================
router.get("/users/:userid/issues/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { userid, id } = req.params;

    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ error: "User not found" });

    const issue = await Issue.findOne({ _id: id, user_id: user._id })
      .populate("user_id", "name email")
      .populate("department_id", "name");

    if (!issue) return res.status(404).json({ error: "Issue not found" });

    if (req.user.role === "citizen" && req.user.id !== user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to view this issue" });
    }

    res.json(issue);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ====================================================================
// 4. GET ALL ISSUES (BY ROLE)
// ====================================================================
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const role = req.user.role;

    let issues;
    if (role === "admin") {
      issues = await Issue.find({ department_id: req.user.department_id })
        .populate("user_id", "username email")
        .populate("department_id", "name");
    } else {
      issues = await Issue.find({ user_id: req.user.id }).populate("department_id", "name");
    }

    res.json(issues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ====================================================================
// 5. UPDATE ISSUE STATUS (ADMIN ONLY)
// ====================================================================
router.patch("/:id/status", authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { status, priority } = req.body;
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status, priority },
      { new: true }
    );

    if (!issue) return res.status(404).json({ error: "Issue not found" });

    res.json(issue);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
