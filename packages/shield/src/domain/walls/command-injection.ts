import type { ValueDetector } from "../detector.js";
import { createSignatureWall } from "./signature-wall.js";
import { ALL_SURFACES } from "./surfaces.js";

export const commandInjectionWall: ValueDetector = createSignatureWall("command-injection", "high", ALL_SURFACES);
