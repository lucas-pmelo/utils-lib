import type { Detector, DetectorContext, ShieldConfig } from "./detector";
import type {
  Finding,
  ScanResult,
  ScanSurfaces,
  ScannedFile,
  Severity,
  Surface,
} from "./models";
import { decodedVariants } from "./normalize";
import { walk } from "./traversal/walk";

const SEVERITY_ORDER: Severity[] = ["low", "medium", "high", "critical"];
const OVERSIZED_WALL_ID = "oversized-payload";
const SCAN_FAILURE_WALL_ID = "shield";
const MAX_SAMPLE_LENGTH = 32;

/** Bounded, digit-masked excerpt — enough to triage a block, never the payload. */
function redactSample(value: string): string {
  const masked = value.replace(/\d{4,}/g, "####");
  return masked.length > MAX_SAMPLE_LENGTH ? `${masked.slice(0, MAX_SAMPLE_LENGTH)}…` : masked;
}

function highestOf(findings: Finding[]): Severity | undefined {
  let highest: Severity | undefined;
  for (const finding of findings) {
    if (!highest || SEVERITY_ORDER.indexOf(finding.severity) > SEVERITY_ORDER.indexOf(highest)) {
      highest = finding.severity;
    }
  }
  return highest;
}

function activeWalls(config: ShieldConfig): Detector[] {
  const disabled = new Set(config.disable ?? []);
  return [...config.walls, ...(config.add ?? [])].filter((wall) => !disabled.has(wall.id));
}

/**
 * Pure detection core. Runs every enabled wall over the normalized surfaces
 * and returns a verdict; it never throws, and knows nothing about HTTP.
 */
export function scan(surfaces: ScanSurfaces, config: ShieldConfig): ScanResult {
  try {
    return runScan(surfaces, config);
  } catch (error) {
    // A wall misbehaved. Fail closed rather than waving the request through,
    // and carry the reason — a custom wall that throws on every request is
    // otherwise an undiagnosable blanket block.
    const reason = error instanceof Error ? error.message : "unknown";
    return {
      verdict: "block",
      findings: [
        {
          wallId: SCAN_FAILURE_WALL_ID,
          severity: "critical",
          surface: "body",
          path: "",
          sample: redactSample(`scan failed: ${reason}`),
        },
      ],
      highestSeverity: "critical",
      truncated: true,
    };
  }
}

function runScan(surfaces: ScanSurfaces, config: ShieldConfig): ScanResult {
  const walls = activeWalls(config);
  const { limits } = config;
  const findings: Finding[] = [];
  let truncated = false;

  const oversizedWall = walls.find((wall) => wall.id === OVERSIZED_WALL_ID);

  function reportOversized(surface: Surface, path: string, sample: string): void {
    truncated = true;
    if (!oversizedWall) return;
    findings.push({
      wallId: OVERSIZED_WALL_ID,
      severity: oversizedWall.severity,
      surface,
      path,
      sample,
    });
  }

  function runValueWalls(value: string, surface: Surface, path: string): void {
    // Size cap before any regex — this is the primary ReDoS defense.
    if (value.length > limits.maxStringLength) {
      reportOversized(surface, path, "value exceeds scan limits");
      return;
    }

    const ctx: DetectorContext = { surface, path, limits };
    const variants = decodedVariants(value);

    for (const wall of walls) {
      if (wall.kind !== "value" || !wall.surfaces.includes(surface)) continue;
      const hit = variants.find((variant) => wall.test(variant, ctx));
      if (hit === undefined) continue;
      findings.push({
        wallId: wall.id,
        severity: wall.severity,
        surface,
        path,
        sample: redactSample(hit),
      });
    }
  }

  function runStructuralWalls(key: string, value: unknown, surface: Surface, path: string): void {
    const ctx: DetectorContext = { surface, path, limits };
    for (const wall of walls) {
      if (wall.kind !== "structural" || !wall.inspectNode(key, value, ctx)) continue;
      findings.push({
        wallId: wall.id,
        severity: wall.severity,
        surface,
        path,
        sample: redactSample(key),
      });
    }
  }

  /**
   * One traversal serves every surface. Query strings and headers are trees
   * too — `?tags[]=a&tags[]=b` reaches an adapter as an array — so scanning
   * them with the same walk is what keeps a nested query param from arriving
   * at a wall as a non-string and crashing it.
   *
   * Keys are scanned as values as well as being offered to structural walls.
   * A key reaches a sink as readily as a value does: dynamic filter and sort
   * parameters get built into SQL, and map keys get rendered into HTML.
   */
  function scanTree(value: unknown, surface: Surface, rootPath: string): void {
    const outcome = walk(
      value,
      limits,
      {
        onNode: (key, node, path) => {
          if (!key) return;
          runStructuralWalls(key, node, surface, path);
          runValueWalls(key, surface, path);
        },
        onLeafString: (leaf, path) => runValueWalls(leaf, surface, path),
      },
      rootPath,
    );

    if (outcome.truncated) reportOversized(surface, rootPath, `${rootPath} exceeds scan limits`);
  }

  function scanFiles(files: ScannedFile[]): void {
    for (const wall of walls) {
      if (wall.kind !== "file") continue;
      for (const [index, file] of files.entries()) {
        const fileFindings = wall.inspect(file, index, limits);
        if (fileFindings) findings.push(...fileFindings);
      }
    }
  }

  scanTree(surfaces.headers, "header", "header");
  scanTree(surfaces.query, "query", "query");
  scanTree(surfaces.pathParameters, "path", "path");
  scanTree(surfaces.body, "body", "body");
  if (surfaces.files) scanFiles(surfaces.files);

  return {
    verdict: findings.length ? "block" : "allow",
    findings,
    ...(findings.length && { highestSeverity: highestOf(findings) }),
    truncated,
  };
}
