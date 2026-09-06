import type { Finding, Limits, ScannedFile, Severity, Surface } from "./models.js";

export interface DetectorContext {
  surface: Surface;
  path: string;
  limits: Limits;
}

/** Inspects individual leaf strings. */
export interface ValueDetector {
  kind: "value";
  id: string;
  severity: Severity;
  surfaces: readonly Surface[];
  test(value: string, ctx: DetectorContext): boolean;
}

/** Inspects structure and shape during the body walk. */
export interface StructuralDetector {
  kind: "structural";
  id: string;
  severity: Severity;
  inspectNode(key: string, value: unknown, ctx: DetectorContext): boolean;
}

/** Inspects uploaded file metadata. */
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
  /** Wall ids to switch off for this call. */
  disable?: readonly string[];
  /** Extra custom walls appended for this call. */
  add?: readonly Detector[];
}
