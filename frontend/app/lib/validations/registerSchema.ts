import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),

    email: z.string().email("Invalid email address"),

    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be 10 digits")
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character."
      ),

    address: z.string().optional(),

    role: z
      .enum(["citizen", "admin"])
      .refine((val) => !!val, { message: "Role is required" }),

    department_id: z.string().optional(),
  })
  .refine(
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
