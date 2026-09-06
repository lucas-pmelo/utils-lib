import { commandInjectionWall } from "./command-injection";
import { fileSafetyWall } from "./file/file-safety";
import { jailbreakWall } from "./jailbreak";
import { oversizedPayloadWall } from "./oversized-payload";
import { pathTraversalWall } from "./path-traversal";
import { promptInjectionWall } from "./prompt-injection";
import { prototypePollutionWall } from "./prototype-pollution";
import { sqliWall } from "./sqli";
import { xssWall } from "./xss";
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