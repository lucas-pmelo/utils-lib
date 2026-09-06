export declare function createResponse<T>({ status, data }: {
    status: number;
    data: T;
}): Response;
export declare function withErrorHandler<T>(fn: () => Promise<T>, message: string): Promise<T | Response>;
