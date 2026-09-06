export type Surface = "header" | "query" | "path" | "body" | "file";
export type Severity = "low" | "medium" | "high" | "critical";
export type Verdict = "allow" | "block";
export interface ScannedFile {
    filename: string;
    mimeType?: string;
    size: number;
    head?: Uint8Array;
}
export type FlatSurface = Record<string, unknown>;
export interface ScanSurfaces {
    headers?: FlatSurface;
    query?: FlatSurface;
    pathParameters?: FlatSurface;
    body?: unknown;
    files?: ScannedFile[];
}
export interface Finding {
    wallId: string;
    severity: Severity;
    surface: Surface;
    path: string;
    sample: string;
}
export interface ScanResult {
    verdict: Verdict;
    findings: Finding[];
    highestSeverity?: Severity;
    truncated: boolean;
}
export interface Limits {
    maxBodyBytes: number;
    maxStringLength: number;
    maxDepth: number;
    maxNodes: number;
    maxFiles: number;
    maxFileBytes: number;
}
