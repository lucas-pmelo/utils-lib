import type { ValueDetector } from "../detector";
import { createSignatureWall } from "./signature-wall";
import { ALL_SURFACES } from "./surfaces";

export const jailbreakWall: ValueDetector = createSignatureWall("jailbreak", "medium", ALL_SURFACES);
