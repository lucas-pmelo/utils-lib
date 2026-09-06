import type { ValueDetector } from "../detector";
import { createSignatureWall } from "./signature-wall";
import { ALL_SURFACES } from "./surfaces";

export const promptInjectionWall: ValueDetector = createSignatureWall("prompt-injection", "medium", ALL_SURFACES);
