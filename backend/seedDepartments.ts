// seedDepartments.ts
import dotenv from "dotenv";
import mongoose from "mongoose";
import Department from "./models/Department"; // Adjust path if needed

dotenv.config(); // load .env file

async function seedDepartments() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const departments = [
      {
        name: "Sanitation",
        contact_email: "sanitation@janbol.gov",
        contact_phone: "9991110001",
      },
      {
        name: "Roads",
        contact_email: "roads@janbol.gov",
        contact_phone: "9991110002",
      },
      {
        name: "Electricity",
        contact_email: "electricity@janbol.gov",
        contact_phone: "9991110003",
      },
    ];

    // clear old departments if you want a clean seed
    await Department.deleteMany({});
    console.log("🗑️ Old departments removed");

    await Department.insertMany(departments);
    console.log("🌱 Departments seeded successfully!");

    mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error seeding departments:", error);
    mongoose.disconnect();
  }
}

seedDepartments();
