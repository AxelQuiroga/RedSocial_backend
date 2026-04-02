import { z } from "zod";

export const idParam = z.object({
  id: z.string().min(1)
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const emailField = z.string().trim().email();
export const passwordField = z.string().min(6);
export const usernameField = z.string().trim().min(3);
