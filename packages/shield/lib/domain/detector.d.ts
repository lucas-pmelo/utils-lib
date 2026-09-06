import type { Finding, Limits, ScannedFile, Severity, Surface } from "./models";
export interface DetectorContext {
    surface: Surface;
    path: string;
    limits: Limits;
}
export interface ValueDetector {
    kind: "value";
    id: string;
    severity: Severity;
    surfaces: readonly Surface[];
    test(value: string, ctx: DetectorContext): boolean;
}
export interface StructuralDetector {
    kind: "structural";
    id: string;
    severity: Severity;
    inspectNode(key: string, value: unknown, ctx: DetectorContext): boolean;
}
export interface FileDetector {
    kind: "file";
    id: string;
    severity: Severity;
    inspect(file: ScannedFile, index: number, limits: Limits): Finding[] | null;
}
export type Detector = ValueDetector | StructuralDetector | FileDetector;
export interface ShieldConfig {
    walls: readonly Detector[];
    limits: Limits;
    disable?: readonly string[];
    add?: readonly Detector[];
}
