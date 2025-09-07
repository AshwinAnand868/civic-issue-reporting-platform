import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = "SMS" | "Email" | "In-App";

export interface INotification extends Document {
  message: string;
  type: NotificationType;
  timestamp: Date;
  user_id: mongoose.Types.ObjectId;
  issue_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
  {
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ["SMS", "Email", "In-App"], default: "In-App" },
    timestamp: { type: Date, default: Date.now },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    issue_id: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);