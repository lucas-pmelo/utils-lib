import ShieldBlockedError from "../errors/shield-blocked-error.js";
import { resolveConfig } from "../domain/resolve-config.js";
import { scan } from "../domain/scan.js";
export function guard(surfaces, preset, override) {
    const result = scan(surfaces, resolveConfig(preset, override));
    if (result.verdict === "block")
        throw new ShieldBlockedError(result);
}
//# sourceMappingURL=guard.js.map