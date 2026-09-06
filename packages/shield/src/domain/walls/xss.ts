import type { ValueDetector } from "../detector";
import { createSignatureWall } from "./signature-wall";
import { ALL_SURFACES } from "./surfaces";

export const xssWall: ValueDetector = createSignatureWall("xss", "high", ALL_SURFACES);
