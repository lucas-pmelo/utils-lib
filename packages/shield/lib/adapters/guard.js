import ShieldBlockedError from "../errors/shield-blocked-error";
import { resolveConfig } from "../domain/resolve-config";
import { scan } from "../domain/scan";
export function guard(surfaces, preset, override) {
    const result = scan(surfaces, resolveConfig(preset, override));
    if (result.verdict === "block")
        throw new ShieldBlockedError(result);
}
//# sourceMappingURL=guard.js.map