export type Surface = "header" | "query" | "path" | "body" | "file";

export type Severity = "low" | "medium" | "high" | "critical";

export type Verdict = "allow" | "block";

/** First bytes of a file kept for magic-byte checks. */
export interface ScannedFile {
  filename: string;
  mimeType?: string;
  size: number;
  head?: Uint8Array;
}

/**
 * A flat surface as a framework actually hands it over.
 *
 * Values are `unknown` rather than `string` because they are not strings:
 * Express's `qs` parser turns `?tags[]=a&tags[]=b` into an array and `?f[x]=1`
 * into an object, and a Fastify schema coerces a param to a number. The core
 * walks whatever arrives and scans the strings it finds.
 */
export type FlatSurface = Record<string, unknown>;

/** Normalized input the core scans. Adapters build this. */
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
  /** Redacted and truncated matched slice — never the full payload. */
  sample: string;
}

export interface ScanResult {
  verdict: Verdict;
  findings: Finding[];
  highestSeverity?: Severity;
  /** A traversal cap was tripped, so the payload was not fully scanned. */
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
