import type { Detector } from "../detector";
import { commandInjectionWall } from "./command-injection";
import { fileSafetyWall } from "./file/file-safety";
import { jailbreakWall } from "./jailbreak";
import { oversizedPayloadWall } from "./oversized-payload";
import { pathTraversalWall } from "./path-traversal";
import { promptInjectionWall } from "./prompt-injection";
import { prototypePollutionWall } from "./prototype-pollution";
import { sqliWall } from "./sqli";
import { xssWall } from "./xss";

/**
 * The walls every preset enables.
 *
 * The LLM walls are deliberately absent — see `llmWalls`.
 */
export const defaultWalls: readonly Detector[] = [
  sqliWall,
  xssWall,
  pathTraversalWall,
  commandInjectionWall,
  prototypePollutionWall,
  oversizedPayloadWall,
  fileSafetyWall,
];

/**
 * Opt-in walls for endpoints that feed a model.
 *
 * They are off by default because they match natural language, and natural
 * language is what a free-text field holds: "you are now subscribed" and "how
 * to jailbreak your old iPhone" are ordinary product copy. Mounted on every
 * field of an API that talks to no model, they are a false-positive engine
 * guarding nothing.
 *
 * ```ts
 * withShieldElysia(publicApiPreset, { add: [...llmWalls] });
 * ```
 */
export const llmWalls: readonly Detector[] = [promptInjectionWall, jailbreakWall];

export {
  commandInjectionWall,
  fileSafetyWall,
  jailbreakWall,
  oversizedPayloadWall,
  pathTraversalWall,
  promptInjectionWall,
  prototypePollutionWall,
  sqliWall,
  xssWall,
};
