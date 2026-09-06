import type { Detector } from "../detector.js";
import { commandInjectionWall } from "./command-injection.js";
import { fileSafetyWall } from "./file/file-safety.js";
import { jailbreakWall } from "./jailbreak.js";
import { oversizedPayloadWall } from "./oversized-payload.js";
import { pathTraversalWall } from "./path-traversal.js";
import { promptInjectionWall } from "./prompt-injection.js";
import { prototypePollutionWall } from "./prototype-pollution.js";
import { sqliWall } from "./sqli.js";
import { xssWall } from "./xss.js";

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
