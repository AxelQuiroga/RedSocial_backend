/**
 * Clase base para todos los errores de dominio.
 *
 * Solo contiene información semántica del dominio:
 * - `message`: texto legible para el desarrollador/usuario final
 * - `code`: identificador estable para consumo programático (frontend, workers, etc.)
 *
 * NO contiene información de transporte (HTTP status codes, etc.)
 * Eso es responsabilidad de la capa de entrada (Express, CLI, etc.)
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
