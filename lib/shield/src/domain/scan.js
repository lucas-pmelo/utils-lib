"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = scan;
const walk_1 = require("./traversal/walk");
const SEVERITY_ORDER = ["low", "medium", "high", "critical"];
const OVERSIZED_WALL_ID = "oversized-payload";
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
    var _a;
    const disabled = new Set((_a = config.disable) !== null && _a !== void 0 ? _a : []);
    const enabled = config.walls.filter((wall) => !disabled.has(wall.id));
    return config.add ? [...enabled, ...config.add.filter((wall) => !disabled.has(wall.id))] : enabled;
}
function scan(surfaces, config) {
    try {
        return runScan(surfaces, config);
    }
    catch (_a) {
        return {
            verdict: "block",
            findings: [
                { wallId: "shield", severity: "critical", surface: "body", path: "", sample: "scan failed" },
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
        const ctx = { surface, path, limits };
        for (const wall of walls) {
            if (wall.kind !== "value" || !wall.surfaces.includes(surface))
                continue;
            if (wall.test(value, ctx)) {
                findings.push({
                    wallId: wall.id,
                    severity: wall.severity,
                    surface,
                    path,
                    sample: redactSample(value),
                });
            }
        }
    }
    function scanFlatSurface(values, surface) {
        if (!values)
            return;
        for (const [key, value] of Object.entries(values)) {
            if (value === undefined)
                continue;
            const path = `${surface}.${key}`;
            if (value.length > limits.maxStringLength) {
                reportOversized(surface, path, "value exceeds scan limits");
                continue;
            }
            runValueWalls(value, surface, path);
        }
    }
    function scanBody(body) {
        const structural = walls.filter((wall) => wall.kind === "structural");
        const outcome = (0, walk_1.walk)(body, limits, {
            onNode: (key, value, path) => {
                const ctx = { surface: "body", path, limits };
                for (const wall of structural) {
                    if (wall.kind === "structural" && wall.inspectNode(key, value, ctx)) {
                        findings.push({
                            wallId: wall.id,
                            severity: wall.severity,
                            surface: "body",
                            path,
                            sample: redactSample(key),
                        });
                    }
                }
            },
            onLeafString: (value, path) => runValueWalls(value, "body", path),
        });
        if (outcome.truncated)
            reportOversized("body", "body", "payload exceeds scan limits");
    }
    function scanFiles(files) {
        for (const wall of walls) {
            if (wall.kind !== "file")
                continue;
            files.forEach((file, index) => {
                const fileFindings = wall.inspect(file, index, limits);
                if (fileFindings)
                    findings.push(...fileFindings);
            });
        }
    }
    scanFlatSurface(surfaces.headers, "header");
    scanFlatSurface(surfaces.query, "query");
    scanFlatSurface(surfaces.pathParameters, "path");
    scanBody(surfaces.body);
    if (surfaces.files)
        scanFiles(surfaces.files);
    return Object.assign(Object.assign({ verdict: findings.length ? "block" : "allow", findings }, (findings.length && { highestSeverity: highestOf(findings) })), { truncated });
}
//# sourceMappingURL=scan.js.map