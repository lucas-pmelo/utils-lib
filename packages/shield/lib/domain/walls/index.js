import { commandInjectionWall } from "./command-injection.js";
import { fileSafetyWall } from "./file/file-safety.js";
import { jailbreakWall } from "./jailbreak.js";
import { oversizedPayloadWall } from "./oversized-payload.js";
import { pathTraversalWall } from "./path-traversal.js";
import { promptInjectionWall } from "./prompt-injection.js";
import { prototypePollutionWall } from "./prototype-pollution.js";
import { sqliWall } from "./sqli.js";
import { xssWall } from "./xss.js";
export const defaultWalls = [
    sqliWall,
    xssWall,
    pathTraversalWall,
    commandInjectionWall,
    prototypePollutionWall,
    oversizedPayloadWall,
    fileSafetyWall,
];
export const llmWalls = [promptInjectionWall, jailbreakWall];
export { commandInjectionWall, fileSafetyWall, jailbreakWall, oversizedPayloadWall, pathTraversalWall, promptInjectionWall, prototypePollutionWall, sqliWall, xssWall, };
//# sourceMappingURL=index.js.map