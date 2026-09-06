import type { ValueDetector } from "../detector.js";
import { createSignatureWall } from "./signature-wall.js";
import { ALL_SURFACES } from "./surfaces.js";

export const xssWall: ValueDetector = createSignatureWall("xss", "high", ALL_SURFACES);
