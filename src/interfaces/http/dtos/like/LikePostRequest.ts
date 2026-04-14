/**
 * DTO para la petición HTTP de dar like a un post.
 *
 * @remarks
 * El userId NO va aquí - viene del JWT en el header Authorization.
 * Solo necesitamos el postId que viene en el body.
 */
export interface LikePostRequest {
  /** ID del post a dar like (UUID) */
  postId: string;
}
