/**
 * Datos de entrada para actualizar un post existente.
 * 
 * @remarks
 * Todos los campos son opcionales porque el usuario puede elegir
 * actualizar solo el título, solo el contenido, o ambos.
 * 
 * El use case valida que al menos un campo esté presente.
 * 
 * @example
 * ```typescript
 * // Actualizar solo el título
 * { title: "Nuevo título" }
 * 
 * // Actualizar ambos
 * { title: "Nuevo título", content: "Nuevo contenido" }
 * ```
 */
export interface UpdatePostInput {
  /** Nuevo título del post (opcional). */
  title?: string;
  
  /** Nuevo contenido del post (opcional). */
  content?: string;
}