import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standard API response utility functions for consistent error handling
 */

export interface ApiError {
  error: string;
  details?: unknown;
  code?: string;
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function errorResponse(
  error: string,
  status = 500,
  details?: unknown,
  code?: string
) {
  const response: ApiError = { error };
  if (details) response.details = details;
  if (code) response.code = code;
  return NextResponse.json(response, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, 401, undefined, "UNAUTHORIZED");
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, 403, undefined, "FORBIDDEN");
}

export function notFoundResponse(message = "Resource not found") {
  return errorResponse(message, 404, undefined, "NOT_FOUND");
}

export function badRequestResponse(
  message = "Bad request",
  details?: unknown
) {
  return errorResponse(message, 400, details, "BAD_REQUEST");
}

export function validationErrorResponse(errors: z.ZodError) {
  return errorResponse(
    "Validation failed",
    400,
    errors.errors,
    "VALIDATION_ERROR"
  );
}

export function internalErrorResponse(
  error: unknown,
  message = "Internal server error"
) {
  // Log error for monitoring
  console.error("API Error:", error);
  
  // In production, don't expose internal errors
  const isDevelopment = process.env.NODE_ENV === "development";
  
  return errorResponse(
    message,
    500,
    isDevelopment ? (error instanceof Error ? error.message : String(error)) : undefined,
    "INTERNAL_ERROR"
  );
}

/**
 * Wrapper for API route handlers with consistent error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>,
  options?: {
    logError?: boolean;
    defaultMessage?: string;
  }
) {
  return async (): Promise<NextResponse> => {
    try {
      return await handler();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }

      if (options?.logError !== false) {
        console.error("API Handler Error:", error);
      }

      return internalErrorResponse(
        error,
        options?.defaultMessage || "An error occurred"
      );
    }
  };
}

