import type { LikeRepository } from "../../../domain/repositories/LikeRepository.js";
import type { UnlikePostInput } from "../../contracts/like/UnlikePostInput.js";

/**
 * Caso de uso para quitar like a un post.
 *
 * @remarks
 * Lógica de negocio:
 * - Verifica que el like exista (el usuario había dado like)
 * - Elimina el like
 *
 * Es idempotente: si el like no existe, no hay error (ya está "unliked").
 *
 * @example
 * ```typescript
 * const useCase = new UnlikePostUseCase(likeRepository);
 * const success = await useCase.execute("user-123", { postId: "post-456" });
 * console.log(success); // true si se eliminó, false si no existía
 * ```
 */
export class UnlikePostUseCase {
  constructor(private likeRepository: LikeRepository) {}

  /**
   * Ejecuta la eliminación de un like.
   *
   * @param userId - ID del usuario autenticado (del JWT)
   * @param data - Datos de entrada (postId)
   * @returns true si se eliminó el like, false si no existía
   */
  async execute(userId: string, data: UnlikePostInput): Promise<boolean> {
    return this.likeRepository.delete(userId, data.postId);
  }
}
