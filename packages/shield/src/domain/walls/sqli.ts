import type { ValueDetector } from "../detector";
import { createSignatureWall } from "./signature-wall";
import { ALL_SURFACES } from "./surfaces";

export const sqliWall: ValueDetector = createSignatureWall("sqli", "high", ALL_SURFACES);
