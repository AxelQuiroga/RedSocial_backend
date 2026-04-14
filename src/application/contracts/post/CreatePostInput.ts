/**
 * Datos de entrada para crear un nuevo post.
 * 
 * @remarks
 * Este contrato define los campos obligatorios que debe proporcionar
 * un usuario para crear un post. El mapper HTTP se encarga de
 * convertir el request body a este formato.
 * 
 * Validaciones del use case:
 * - title: mínimo 3 caracteres
 * - content: mínimo 10 caracteres
 */
export interface CreatePostInput {
  /** Título del post. Será limpiado de espacios en blanco por el mapper. */
  title: string;
  
  /** Contenido del post en texto plano o markdown. */
  content: string;
}