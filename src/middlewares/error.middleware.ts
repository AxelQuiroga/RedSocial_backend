import type { Request, Response, NextFunction } from "express";
import { DomainError } from "../domain/errors/DomainError.js";
import { domainErrorToHttpStatus } from "./domainErrorMapper.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof DomainError) {
    const status = domainErrorToHttpStatus(err);
    return res.status(status).json({
      error: err.message,
      code: err.code,
    });
  }

  // Errores inesperados (no son de dominio)
  console.error("[UNEXPECTED ERROR]", err);
  return res.status(500).json({
    error: "Error interno del servidor",
    code: "INTERNAL_ERROR",
  });
}