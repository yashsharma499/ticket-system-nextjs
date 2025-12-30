import { z } from "zod";

export const ticketUpdateSchema = z.object({
  status: z.enum(["Open", "In Progress", "Resolved", "Closed"]).optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
  assignedTo: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "No update fields provided!",
});
