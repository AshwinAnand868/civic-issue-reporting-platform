import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone number must be 10 digits")
    .optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  address: z.string().optional(),
  role: z.enum(["citizen", "admin"]),
  department_id: z.string().optional(), // validated only if role = admin
}).refine(
  (data) => {
    if (data.role === "admin" && !data.department_id) {
      return false;
    }
    return true;
  },
  {
    message: "Department ID is required for admin role",
    path: ["department_id"],
  }
);
