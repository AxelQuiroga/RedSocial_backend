/**
 * Datos de entrada para dar like a un post.
 *
 * @remarks
 * El userId NO va aquí - viene del JWT en el controller.
 * El mapper extrae postId del request body.
 */
export interface LikePostInput {
  /** ID del post a dar like (UUID) */
  postId: string;
}