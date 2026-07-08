import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { EventBus } from "../../../domain/events/EventBus.js";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError.js";
import { NotFoundError } from "../../../domain/errors/NotFoundError.js";

export class DeletePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private eventBus: EventBus
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    // 1. Buscar post
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundError("Post no encontrado", "POST_NOT_FOUND");
    }

    // 2. Verificar autorización
    if (post.authorId !== userId) {
      throw new ForbiddenError("No autorizado para eliminar este post", "DELETE_POST_FORBIDDEN");
    }

    // 3. Emitir evento antes de eliminar (listeners necesitan postId para cleanup)
    this.eventBus.emit('post.deleted', {
      type: 'POST_DELETED',
      postId: postId,
      authorId: userId
    });

    // 4. Eliminar
    await this.postRepository.deleteById(postId);
  }
}