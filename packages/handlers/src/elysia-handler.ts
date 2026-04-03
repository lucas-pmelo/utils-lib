export function createResponse<T>({ status, data }: { status: number; data: T }): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function withErrorHandler<T>(
  fn: () => Promise<T>,
  errorMessage: string,
): Promise<T | Response> {
  try {
    return await fn();
  } catch {
    return createResponse({ status: 500, data: { error: errorMessage } });
  }
}
