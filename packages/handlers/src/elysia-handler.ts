import ClbError from "./errors/clb-error";

export function createResponse<T>({ status, data }: { status: number; data: T }): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  message: string,
): Promise<T | Response> {
  try {
    return await fn();
  } catch (error) {
    if (error && typeof error === "object" && (error as ClbError).isTreated) {
      const clbError = error as ClbError;
      return createResponse({ status: clbError.statusCode, data: clbError.toObject() });
    }
    return createResponse({ status: 500, data: { error: message } });
  }
}
