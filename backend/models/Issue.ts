import mongoose, { Document, Schema } from "mongoose";

export type IssueStatus = "Submitted" | "Acknowledged" | "In-Progress" | "Resolved" | "Rejected";
export type Priority = "Low" | "Medium" | "High";

export interface IIssue extends Document {
  title: string;
  description: string; // ✅ now required
  photo_url?: string;
  voice_url?: string;
  location: { type: "Point"; coordinates: [number, number] };
  createdAt: Date;
  updatedAt: Date;
  status: IssueStatus;
  priority?: Priority;
  category: string;
  user_id: mongoose.Types.ObjectId;
  department_id?: mongoose.Types.ObjectId;
  assigned_admin_id?: mongoose.Types.ObjectId | null;
}

const IssueSchema: Schema<IIssue> = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true }, // ✅ mandatory now
    photo_url: { type: String, required: false },
    voice_url: { type: String, required: false },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    status: {
      type: String,
      enum: ["Submitted", "Acknowledged", "In-Progress", "Resolved", "Rejected"],
      default: "Submitted",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    category: { type: String, required: true },

    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    department_id: { type: Schema.Types.ObjectId, ref: "Department", required: false },
    assigned_admin_id: { type: Schema.Types.ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

IssueSchema.index({ location: "2dsphere" });

export default mongoose.model<IIssue>("Issue", IssueSchema);
