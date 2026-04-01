import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { UpdatePostInput } from "../../contracts/post/UpdatePostInput.js";
import type { PostOutput } from "../../contracts/post/PostOutput.js";

export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(
    postId: string,
    userId: string,
    data: UpdatePostInput
  ): Promise<PostOutput> {
    // 1. Buscar post
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error("Post no encontrado");
    }

    // 2. Verificar autoría (autorización)
    if (post.authorId !== userId) {
      throw new Error("No autorizado para editar este post");
    }

    // 3. Validar que al menos haya un campo para actualizar
    if (!data.title && !data.content) {
      throw new Error("Debe proporcionar al menos título o contenido para actualizar");
    }

    // 4. Actualizar
    const updatedPost = await this.postRepository.update(postId, data);
    if (!updatedPost) {
      throw new Error("Error al actualizar el post");
    }

    return {
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content,
      authorId: updatedPost.authorId,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt
    };
  }
}
