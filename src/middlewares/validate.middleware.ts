
import type { Request, Response, NextFunction } from "express";
import type {  ZodError } from "zod";
import { z } from "zod"; // Import the Zod library

type Schemas = {
  body?: z.ZodType<any, any, any>; // Use Zod.Any instead of ZodTypeAny
  params?: z.ZodType<any, any, any>; // Use Zod.Any instead of ZodTypeAny
  query?: z.ZodType<any, any, any>; // Use Zod.Any instead of ZodTypeAny
};

type ValidationDetail = {
  location: "body" | "params" | "query";
  path: string;
  message: string;
};

function formatIssues(location: ValidationDetail["location"], error: ZodError): ValidationDetail[] {
  return error.issues.map((issue) => ({
    location,
    path: issue.path.join("."),
    message: issue.message
  }));
}

export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const details: ValidationDetail[] = [];

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) details.push(...formatIssues("body", result.error));
      else req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) details.push(...formatIssues("params", result.error));
      else req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) details.push(...formatIssues("query", result.error));
      else req.query = result.data;
    }

    if (details.length > 0) {
      return res.status(400).json({
        error: "ValidationError",
        details
      });
    }

    return next();
  };
}
