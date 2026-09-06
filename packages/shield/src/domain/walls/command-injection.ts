import type { ValueDetector } from "../detector";
import { createSignatureWall } from "./signature-wall";
import { ALL_SURFACES } from "./surfaces";

export const commandInjectionWall: ValueDetector = createSignatureWall("command-injection", "high", ALL_SURFACES);
