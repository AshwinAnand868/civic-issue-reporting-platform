import mongoose, { Document, Schema } from "mongoose";

export interface IDepartment extends Document {
    name: string;
    contact_email?: string;
    contact_phone?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema: Schema<IDepartment> = new Schema(
    {
        name: {type: String, required: true, trim: true},
        contact_email: { type: String, required: false, lowercase: true, trim: true },
        contact_phone: { type: String, required: false, trim: true },
    },
    {timestamps: true}
)

export default mongoose.model<IDepartment>("Department", DepartmentSchema);