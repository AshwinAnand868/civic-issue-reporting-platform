// backend/models/Admin.ts

import mongoose, { Document, Schema, Types } from "mongoose";

// The Admin schema includes department_id and a fixed role
export interface IAdmin extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  role: "admin"; // Fixed role for security
  department_id: mongoose.Types.ObjectId; // MANDATORY for admins
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, required: false, trim: true },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
      required: true,
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>("Admin", AdminSchema);