import type { ValueDetector } from "../detector.js";
import type { Severity, Surface } from "../models.js";
export declare function createSignatureWall(id: string, severity: Severity, surfaces: readonly Surface[]): ValueDetector;
