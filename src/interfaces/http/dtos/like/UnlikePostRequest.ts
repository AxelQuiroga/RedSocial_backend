/**
 * DTO para la petición HTTP de quitar like a un post.
 *
 * @remarks
 * Igual que LikePostRequest, el userId viene del JWT.
 * El postId puede venir del body o de la URL (/posts/:id/like).
 */
export interface UnlikePostRequest {
  /** ID del post a quitar like (UUID) */
  postId: string;
}
