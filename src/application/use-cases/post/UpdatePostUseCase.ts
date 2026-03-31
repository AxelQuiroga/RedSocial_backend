import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { Post } from "../../../domain/entities/Post.js";
import type { UpdatePostDTO } from "../../dtos/UpdatePostDTO.js";

export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(
    postId: string,
    userId: string,
    data: UpdatePostDTO
  ): Promise<Post> {
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

    return updatedPost;
  }
}