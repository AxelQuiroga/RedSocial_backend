import { z } from "zod";

/**
 * Schema para validar el postId en los parámetros de URL.
 *
 * @remarks
 * Usado en POST /posts/:id/like, DELETE /posts/:id/like, GET /posts/:id/likes
 */
export const likePostParamsSchema = z.object({
  id: z.string().uuid({ message: "El ID del post debe ser un UUID válido" })
});
