import express from "express";
import { authMiddleware } from "../middleware/auth";
import Issue from "../models/Issue";
import User from "../models/User";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {title, description, location, category, photo_url, voice_url, department_id, priority } = req.body;
        const issue = new Issue({
            title,
            description,
            location,
            category,
            photo_url,
            voice_url,
            department_id,
            priority,
            user_id: req.user.id
        });

        await issue.save();
        res.status(201).json(issue);

    } catch {
        res.status(500).json({ error: "Error while creating issue" })
    }
});

router.get("/users/:userid/issues/:id", authMiddleware, async (req, res) => {
  try {
    const { userid, id } = req.params;

    const user = await User.findOne({ _id: userid });
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


router.get("/", authMiddleware, async (req, res) => {
  try {
    const role = req.user.role;

    let issues;
    if (role === "admin") {
      issues = await Issue.find({ department_id: req.user.department_id })
        .populate("user_id", "username email")
        .populate("department_id", "name");
    } else {
      issues = await Issue.find({ user_id: req.user.id })
        .populate("department_id", "name");
    }

    res.json(issues);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
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