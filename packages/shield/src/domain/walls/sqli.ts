import type { ValueDetector } from "../detector.js";
import { createSignatureWall } from "./signature-wall.js";
import { ALL_SURFACES } from "./surfaces.js";

export const sqliWall: ValueDetector = createSignatureWall("sqli", "high", ALL_SURFACES);
