import { DomainError } from "./DomainError.js";

/**
 * Error para datos inválidos o reglas de validación.
 *
 * @example
 * throw new ValidationError("El contenido es requerido", "CONTENT_REQUIRED");
 * throw new ValidationError("No se puede responder a una respuesta", "NESTED_REPLY_NOT_ALLOWED");
 */
export class ValidationError extends DomainError {
  readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code ?? "VALIDATION_ERROR";
  }
}
