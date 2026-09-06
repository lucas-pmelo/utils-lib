import type { Preset, ShieldOverride } from "../domain/resolve-config.js";
export declare function withShieldBun(preset: Preset, override?: ShieldOverride): (handler: (request: Request) => Response | Promise<Response>) => (request: Request) => Promise<Response>;
