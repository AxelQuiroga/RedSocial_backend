import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { CreatePostInput } from "../../contracts/post/CreatePostInput.js";
import type { PostOutput } from "../../contracts/post/PostOutput.js";

export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(
    userId: string,
    data: CreatePostInput
  ): Promise<PostOutput> {

    // Validar existencia
    if (!data.title || !data.content) {
      throw new Error("Faltan campos obligatorios");
    }

    //  Validar contenido
    if (data.title.length < 3) {
      throw new Error("El título es muy corto");
    }

    if (data.content.length < 10) {
      throw new Error("El contenido es muy corto");
    }

    //  Crear post
    const post = await this.postRepository.create({
      title: data.title,
      content: data.content,
      authorId: userId //  clave
    });

    // Response DTO
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
  }
}
