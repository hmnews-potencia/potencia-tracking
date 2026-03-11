/**
 * Standardized API error response format.
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

/**
 * Creates a standardized API error object.
 */
export function formatApiError(
  status: number,
  message: string,
  code?: string,
): ApiError {
  return { status, message, ...(code && { code }) };
}

/**
 * Creates a Next.js Response from an ApiError.
 */
export function apiErrorResponse(error: ApiError): Response {
  return Response.json(
    { error: error.message, code: error.code },
    { status: error.status },
  );
}
