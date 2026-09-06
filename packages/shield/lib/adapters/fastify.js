import { guard } from "./guard";
export function withShieldFastify(preset, override) {
    return async (request) => {
        guard({
            headers: request.headers,
            query: request.query,
            pathParameters: request.params,
            body: request.body,
        }, preset, override);
    };
}
//# sourceMappingURL=fastify.js.map