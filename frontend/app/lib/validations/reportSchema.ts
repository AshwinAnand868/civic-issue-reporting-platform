import { z } from "zod";

export const reportSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  photo_url: z.url().optional().or(z.literal("")),
  voice_url: z.url().optional().or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High"]),
});

export type ReportFormData = z.infer<typeof reportSchema>;
