import { decodedVariants } from "./normalize.js";
import { walk } from "./traversal/walk.js";
const SEVERITY_ORDER = ["low", "medium", "high", "critical"];
const OVERSIZED_WALL_ID = "oversized-payload";
const SCAN_FAILURE_WALL_ID = "shield";
const MAX_SAMPLE_LENGTH = 32;
function redactSample(value) {
    const masked = value.replace(/\d{4,}/g, "####");
    return masked.length > MAX_SAMPLE_LENGTH ? `${masked.slice(0, MAX_SAMPLE_LENGTH)}…` : masked;
}
function highestOf(findings) {
    let highest;
    for (const finding of findings) {
        if (!highest || SEVERITY_ORDER.indexOf(finding.severity) > SEVERITY_ORDER.indexOf(highest)) {
            highest = finding.severity;
        }
    }
    return highest;
}
function activeWalls(config) {
    const disabled = new Set(config.disable ?? []);
    return [...config.walls, ...(config.add ?? [])].filter((wall) => !disabled.has(wall.id));
}
export function scan(surfaces, config) {
    try {
        return runScan(surfaces, config);
    }
    catch (error) {
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
function runScan(surfaces, config) {
    const walls = activeWalls(config);
    const { limits } = config;
    const findings = [];
    let truncated = false;
    const oversizedWall = walls.find((wall) => wall.id === OVERSIZED_WALL_ID);
    function reportOversized(surface, path, sample) {
        truncated = true;
        if (!oversizedWall)
            return;
        findings.push({
            wallId: OVERSIZED_WALL_ID,
            severity: oversizedWall.severity,
            surface,
            path,
            sample,
        });
    }
    function runValueWalls(value, surface, path) {
        if (value.length > limits.maxStringLength) {
            reportOversized(surface, path, "value exceeds scan limits");
            return;
        }
        const ctx = { surface, path, limits };
        const variants = decodedVariants(value);
        for (const wall of walls) {
            if (wall.kind !== "value" || !wall.surfaces.includes(surface))
                continue;
            const hit = variants.find((variant) => wall.test(variant, ctx));
            if (hit === undefined)
                continue;
            findings.push({
                wallId: wall.id,
                severity: wall.severity,
                surface,
                path,
                sample: redactSample(hit),
            });
        }
    }
    function runStructuralWalls(key, value, surface, path) {
        const ctx = { surface, path, limits };
        for (const wall of walls) {
            if (wall.kind !== "structural" || !wall.inspectNode(key, value, ctx))
                continue;
            findings.push({
                wallId: wall.id,
                severity: wall.severity,
                surface,
                path,
                sample: redactSample(key),
            });
        }
    }
    function scanTree(value, surface, rootPath) {
        const outcome = walk(value, limits, {
            onNode: (key, node, path) => {
                if (!key)
                    return;
                runStructuralWalls(key, node, surface, path);
                runValueWalls(key, surface, path);
            },
            onLeafString: (leaf, path) => runValueWalls(leaf, surface, path),
        }, rootPath);
        if (outcome.truncated)
            reportOversized(surface, rootPath, `${rootPath} exceeds scan limits`);
    }
    function scanFiles(files) {
        for (const wall of walls) {
            if (wall.kind !== "file")
                continue;
            for (const [index, file] of files.entries()) {
                const fileFindings = wall.inspect(file, index, limits);
                if (fileFindings)
                    findings.push(...fileFindings);
            }
        }
    }
    scanTree(surfaces.headers, "header", "header");
    scanTree(surfaces.query, "query", "query");
    scanTree(surfaces.pathParameters, "path", "path");
    scanTree(surfaces.body, "body", "body");
    if (surfaces.files)
        scanFiles(surfaces.files);
    return {
        verdict: findings.length ? "block" : "allow",
        findings,
        ...(findings.length && { highestSeverity: highestOf(findings) }),
        truncated,
    };
}
//# sourceMappingURL=scan.js.map