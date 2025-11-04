import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/types";
import {
  unauthorizedResponse,
  internalErrorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { z } from "zod";

/**
 * API route handler wrapper with authentication and error handling
 */
export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRole?: UserRole | UserRole[];
  validate?: z.ZodSchema;
}

export function createApiHandler<T = unknown>(
  handler: (
    request: NextRequest,
    context: {
      session: Awaited<ReturnType<typeof auth>>;
      validatedBody?: unknown;
    }
  ) => Promise<NextResponse<T>>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Authentication check
      if (options.requireAuth !== false) {
        const session = await auth();

        if (!session?.user) {
          return unauthorizedResponse("Authentication required");
        }

        // Role check
        if (options.requireRole) {
          const allowedRoles = Array.isArray(options.requireRole)
            ? options.requireRole
            : [options.requireRole];

          if (!allowedRoles.includes(session.user.role as UserRole)) {
            return unauthorizedResponse(
              `Access denied. Required role: ${allowedRoles.join(" or ")}`
            );
          }
        }

        // Body validation
        let validatedBody: unknown;
        if (options.validate) {
          try {
            const body = await request.json();
            validatedBody = options.validate.parse(body);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return validationErrorResponse(error);
            }
            throw error;
          }
        }

        // Execute handler
        return await handler(request, {
          session,
          validatedBody,
        });
      } else {
        // No auth required
        return await handler(request, {
          session: null,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }

      return internalErrorResponse(error);
    }
  };
}

