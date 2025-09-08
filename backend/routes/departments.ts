import express from "express";
import Department from "../models/Department";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const departments = await Department.find({}, { name: 1 });
    // Only return the name and _id
    res.json(departments);
  } catch (err) {
    console.error("Failed to fetch departments:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;