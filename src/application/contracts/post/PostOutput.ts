/**
 * Datos de salida de un post.
 * 
 * @remarks
 * Este contrato define la estructura de datos que devuelven
 * todos los use cases relacionados con posts. Es la interfaz
 * común entre la capa de aplicación y la capa HTTP.
 * 
 * Las fechas son objetos Date que el mapper convierte a ISO string
 * para la respuesta HTTP.
 */
export interface PostOutput {
  /** ID único del post (UUID generado por Prisma). */
  id: string;
  
  /** Título del post. */
  title: string;
  
  /** Contenido completo del post. */
  content: string;
  
  /** ID del usuario que creó el post. */
  authorId: string;
  
  /** Fecha de creación. */
  createdAt: Date;
  
  /** Fecha de última modificación. */
  updatedAt: Date;
}