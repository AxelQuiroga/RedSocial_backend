import { z } from "zod";
import { emailField, passwordField, usernameField } from "./common.js";

export const registerSchema = {
  body: z.object({
    email: emailField,
    password: passwordField,
    username: usernameField
  }).strict()
};

export const loginSchema = {
  body: z.object({
    email: emailField,
    password: passwordField
  }).strict()
};

export const updateUserSchema = {
  body: z.object({
    email: emailField.optional(),
    username: usernameField.optional()
  })
  .refine((data) => data.email !== undefined || data.username !== undefined, {
    message: "Debe enviar email o username"
  })
  .strict()
};
