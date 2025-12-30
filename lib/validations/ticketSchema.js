import { z } from "zod";

export const ticketSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  attachments: z.array(z.string()).optional(),
});
