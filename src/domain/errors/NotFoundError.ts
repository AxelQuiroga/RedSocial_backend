import { DomainError } from "./DomainError.js";

/**
 * Error para recursos que no existen.
 *
 * @example
 * throw new NotFoundError("Post no encontrado", "POST_NOT_FOUND");
 * throw new NotFoundError("Comentario no encontrado");
 */
export class NotFoundError extends DomainError {
  readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code ?? "NOT_FOUND";
  }
}
