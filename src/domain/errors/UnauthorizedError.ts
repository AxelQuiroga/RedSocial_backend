import { DomainError } from "./DomainError.js";

/**
 * Error para autenticación requerida (401).
 * El usuario no está autenticado o las credenciales son inválidas.
 *
 * @example
 * throw new UnauthorizedError("Token inválido o expirado");
 */
export class UnauthorizedError extends DomainError {
  readonly code = "UNAUTHORIZED" as const;
}
