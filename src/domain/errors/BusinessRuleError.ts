import { DomainError } from "./DomainError.js";

/**
 * Error para violaciones de reglas de negocio que no encajan en
 * las categorías estándar (NotFound, Validation, Conflict, etc.).
 *
 * @example
 * throw new BusinessRuleError(
 *   "El comentario padre no pertenece a este post",
 *   "PARENT_COMMENT_NOT_IN_POST"
 * );
 */
export class BusinessRuleError extends DomainError {
  readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.code = code ?? "BUSINESS_RULE_VIOLATION";
  }
}
