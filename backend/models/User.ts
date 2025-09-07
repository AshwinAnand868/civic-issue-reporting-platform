import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password_hash: string;
  address?: string;
  role: "citizen" | "admin";
  department_id?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
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
    address: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["citizen", "admin"],
      default: "citizen",
    },
    department_id: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: function (this: IUser) {
        return this.role === "admin"; // enforce department_id only for admins
      },
    },
  },
  { timestamps: true } // adds createdAt and updatedAt
);

export default mongoose.model<IUser>("User", UserSchema);
