import type { ValueDetector } from "../detector.js";
import { createSignatureWall } from "./signature-wall.js";
import { ALL_SURFACES } from "./surfaces.js";

export const promptInjectionWall: ValueDetector = createSignatureWall("prompt-injection", "medium", ALL_SURFACES);
