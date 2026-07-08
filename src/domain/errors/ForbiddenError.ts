import { DomainError } from "./DomainError.js";

/**
 * Error para autorización denegada (403).
 * El usuario está autenticado pero no tiene permisos para la acción.
 *
 * @example
 * throw new ForbiddenError("No autorizado para eliminar este comentario", "DELETE_COMMENT_FORBIDDEN");
 */
export class ForbiddenError extends DomainError {
  readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code ?? "FORBIDDEN";
  }
}
