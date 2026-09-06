import { guard } from "./guard";
export function withShieldElysia(preset, override) {
    return (context) => {
        guard({
            headers: context.headers,
            query: context.query,
            pathParameters: context.params,
            body: context.body,
        }, preset, override);
    };
}
//# sourceMappingURL=elysia.js.map