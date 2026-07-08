import { DomainError } from "./DomainError.js";

/**
 * Error para conflictos de estado (ej: recurso duplicado, acción ya realizada).
 *
 * @example
 * throw new ConflictError("Ya has dado like a este post", "LIKE_ALREADY_EXISTS");
 * throw new ConflictError("El email ya está registrado", "EMAIL_ALREADY_EXISTS");
 */
export class ConflictError extends DomainError {
  readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code ?? "CONFLICT";
  }
}
