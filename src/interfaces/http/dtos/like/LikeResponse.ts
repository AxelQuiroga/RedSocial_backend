/**
 * DTO para la respuesta HTTP de un like.
 *
 * @remarks
 * Las fechas se devuelven como string ISO (JSON no soporta Date objects).
 */
export interface LikeResponse {
  /** ID único del like (UUID) */
  id: string;

  /** ID del usuario que dio like */
  userId: string;

  /** ID del post que recibió like */
  postId: string;

  /** Fecha de creación en formato ISO 8601 */
  createdAt: string;
}
