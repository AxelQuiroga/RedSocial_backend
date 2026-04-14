import type { PostRepository } from "../../../domain/repositories/PostRepository.js";
import type { UpdatePostInput } from "../../contracts/post/UpdatePostInput.js";
import type { PostOutput } from "../../contracts/post/PostOutput.js";

/**
 * Caso de uso para actualizar un post existente.
 * 
 * @remarks
 * Este use case implementa la lógica de negocio completa para editar posts:
 * - **Autorización**: Solo el autor del post puede editarlo
 * - **Validación**: Requiere al menos un campo (título o contenido)
 * - **Persistencia**: Actualiza mediante el repository
 * 
 * La autorización se hace en el use case (capa de aplicación), no en el controller,
 * garantizando que la regla de negocio se aplique independientemente de la interfaz.
 * 
 * @example
 * ```typescript
 * const useCase = new UpdatePostUseCase(postRepository);
 * const result = await useCase.execute(
 *   "post-456",           // ID del post
 *   "user-123",           // ID del usuario (del JWT)
 *   { title: "Nuevo título" } // Campos a actualizar
 * );
 * ```
 */
export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  /**
   * Ejecuta la actualización de un post con verificación de autoría.
   * 
   * @param postId - ID del post a actualizar
   * @param userId - ID del usuario que intenta editar (del token JWT)
   * @param data - Campos a actualizar (título y/o contenido, opcionales)
   * @returns Post actualizado con todos sus metadatos
   * @throws {Error} "Post no encontrado" - Si el ID no existe
   * @throws {Error} "No autorizado para editar este post" - Si el userId no es el autor
   * @throws {Error} "Debe proporcionar al menos título o contenido" - Si data está vacío
   * @throws {Error} "Error al actualizar el post" - Si falla la operación en DB
   */
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

    // 2. Verificar autoría (autorización de negocio)
    if (post.authorId !== userId) {
      throw new Error("No autorizado para editar este post");
    }

    // 3. Validar que al menos haya un campo para actualizar
    if (!data.title && !data.content) {
      throw new Error("Debe proporcionar al menos título o contenido para actualizar");
    }

    // 4. Actualizar en la base de datos
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
