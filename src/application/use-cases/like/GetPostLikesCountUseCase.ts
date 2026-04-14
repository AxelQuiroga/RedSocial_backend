import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";

/**
 * Caso de uso para obtener el conteo de likes de un post.
 *
 * @remarks
 * Devuelve el número total de likes y si el usuario actual dio like.
 * Útil para el feed de posts (mostrar contador y estado del botón).
 *
 * @example
 * ```typescript
 * const useCase = new GetPostLikesCountUseCase(likeRepository);
 * const result = await useCase.execute("post-456", "user-123");
 * console.log(result.count);      // 42
 * console.log(result.userHasLiked); // true
 * ```
 */
export class GetPostLikesCountUseCase {
  constructor(private likeRepository: LikeRepository) {}

  /**
   * Ejecuta la consulta de likes.
   *
   * @param postId - ID del post a consultar
   * @param userId - ID del usuario actual (opcional, para verificar si dio like)
   * @returns Objeto con conteo total y estado del like del usuario
   */
  async execute(
    postId: string,
    userId?: string
  ): Promise<{ count: number; userHasLiked: boolean }> {
    const count = await this.likeRepository.countByPostId(postId);

    let userHasLiked = false;
    if (userId) {
      userHasLiked = await this.likeRepository.exists(userId, postId);
    }

    return { count, userHasLiked };
  }
}
