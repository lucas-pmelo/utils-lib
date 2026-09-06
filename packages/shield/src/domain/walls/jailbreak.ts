import type { ValueDetector } from "../detector.js";
import { createSignatureWall } from "./signature-wall.js";
import { ALL_SURFACES } from "./surfaces.js";

export const jailbreakWall: ValueDetector = createSignatureWall("jailbreak", "medium", ALL_SURFACES);
