import { DomainError } from "../domain/errors/DomainError.js";
import { NotFoundError } from "../domain/errors/NotFoundError.js";
import { UnauthorizedError } from "../domain/errors/UnauthorizedError.js";
import { ForbiddenError } from "../domain/errors/ForbiddenError.js";
import { ValidationError } from "../domain/errors/ValidationError.js";
import { ConflictError } from "../domain/errors/ConflictError.js";
import { BusinessRuleError } from "../domain/errors/BusinessRuleError.js";

/**
 * Mapa que asocia cada tipo de DomainError con su HTTP status code.
 *
 * Es un arreglo de tuplas [clase, status] para respetar el orden de
 * evaluación con instanceof. El orden importa: las clases más específicas
 * primero si alguna vez las necesitamos.
 *
 * Tiene que ser puro — sin dependencia de Express. Se puede testear
 * unitariamente sin levantar servidor.
 */
const STATUS_MAP: ReadonlyArray<readonly [new (...args: never[]) => DomainError, number]> = [
  [UnauthorizedError, 401],
  [ForbiddenError, 403],
  [NotFoundError, 404],
  [ConflictError, 409],
  [ValidationError, 422],
  [BusinessRuleError, 422],
] as const;

/**
 * Traduce un DomainError a su HTTP status code correspondiente.
 *
 * Si no encuentra match, devuelve 500 por defecto (error inesperado).
 */
export function domainErrorToHttpStatus(error: DomainError): number {
  for (const [ErrorClass, status] of STATUS_MAP) {
    if (error instanceof ErrorClass) {
      return status;
    }
  }
  return 500;
}
