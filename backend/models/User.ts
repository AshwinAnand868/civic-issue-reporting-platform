import mongoose, { Document, Schema, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  address?: string;
  role: "citizen";
  department_id?: mongoose.Types.ObjectId;
  voice_sample?: Buffer;          // raw audio bytes
  voice_sample_mime?: string;     // MIME type like audio/webm
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    password_hash: { type: String, required: true },
    address: { type: String },
    role: { type: String, enum: ["citizen", "admin"], default: "citizen" },
    department_id: { type: Schema.Types.ObjectId, ref: "Department" },
    voice_sample: { type: Buffer },
    voice_sample_mime: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);