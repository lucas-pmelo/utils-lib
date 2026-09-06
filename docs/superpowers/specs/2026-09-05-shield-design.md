# Shield — Design Spec

**Package:** `@lucas-pmelo/shield`
**Status:** Approved design, ready for implementation
**Date:** 2026-09-05

---

## 1. Purpose

`shield` is a defensive, framework-agnostic TypeScript library that scans incoming
request data across every entry surface and **blocks** input that matches known
attack patterns — SQL injection, XSS, path traversal, command injection, prototype
pollution, oversized payloads, unsafe file uploads, **prompt injection**, and
**jailbreak** strings.

It is a **layer of defense-in-depth at the edge**, not a replacement for real
controls. See Non-Goals (§10).

### Design principles (inherited from this repo)
- **Pure core, throw-free** — the detection engine is a pure function like
  `@lucas-pmelo/fast-validators`. It never throws and knows nothing about HTTP.
- **Thin adapters** — one small wrapper per runtime maps that runtime's request
  into a common surface shape and throws on block.
- **Reuse the existing error contract** — blocking throws a `ClbError`-shaped
  error (`isTreated`, `statusCode`, `toObject()`), which the existing
  `withErrorHandler` already turns into a 403. See
  `packages/handlers/src/errors/clb-error.ts` and
  `packages/handlers/src/elysia-handler.ts`.
- **Presets are plain data** — scenario-named, easy to read and diff.

---

## 2. Behavior summary (approved decisions)

| Decision | Choice |
|---|---|
| Threat scope | Web attacks **and** LLM attacks (prompt injection / jailbreak) |
| Adapters | One named wrapper per runtime: `withShieldElysia`, `withShieldExpress`, `withShieldFastify`, `withShieldBun`, `withShieldLambda`, `withShieldSqs` (extensible) |
| Presets | Scenario-based: `publicApiPreset`, `internalApiPreset`, `batchPreset`, `sqsPreset` |
| Override | Second arg = **partial config, deep-merged** over the preset |
| On detection | **Always block** — any malicious hit rejects. No log/report mode in v1 (YAGNI) |
| Non-HTTP block | Throw `ShieldBlockedError` — caller/handler fails the invocation / routes to DLQ |

---

## 3. Architecture

```
┌─ adapters (know a runtime) ──────────────────────────────┐
│  withShieldElysia  withShieldExpress  withShieldFastify  │
│  withShieldBun     withShieldLambda   withShieldSqs      │
│   └─ extract surfaces → scan() → throw on block           │
├─ core (framework-agnostic, pure) ────────────────────────┤
│  scan(surfaces, config) → ScanResult                      │
│  runs every enabled wall, merges findings, sets verdict   │
├─ walls (detectors) ──────────────────────────────────────┤
│  value:      sqli · xss · path-traversal ·                │
│              command-injection · prompt-injection ·        │
│              jailbreak                                     │
│  structural: prototype-pollution · oversized-payload      │
│  file:       file-safety                                  │
└──────────────────────────────────────────────────────────┘
```

Dependency direction is one-way: adapters → core → walls. Adding a runtime =
one new adapter file, zero core changes.

---

## 4. Core contract (`domain/`)

All types live in `domain/models.ts`. The core must not import anything from
`adapters/`.

```ts
export type Surface = "header" | "query" | "path" | "body" | "file";
export type Severity = "low" | "medium" | "high" | "critical";
export type Verdict = "allow" | "block";

/** Normalized input the core scans. Adapters build this. */
export interface ScanSurfaces {
  headers?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  pathParameters?: Record<string, string | undefined>;
  body?: unknown;
  files?: ScannedFile[];
}

export interface ScannedFile {
  filename: string;
  mimeType?: string;
  size: number;
  /** first N bytes for magic-byte checks; adapter supplies, may be undefined */
  head?: Uint8Array;
}

export interface Finding {
  wallId: string;          // "sqli", "prompt-injection", ...
  severity: Severity;
  surface: Surface;
  path: string;            // "body.user.name" | "header.x-forwarded-for" | "file[0].filename"
  sample: string;          // redacted + truncated matched slice — NEVER the full payload
}

export interface ScanResult {
  verdict: Verdict;
  findings: Finding[];
  highestSeverity?: Severity;
  truncated: boolean;      // a traversal cap was tripped
}

export interface Limits {
  maxBodyBytes: number;        // total serialized body size
  maxStringLength: number;     // longest single leaf string scanned
  maxDepth: number;            // object/array nesting
  maxNodes: number;            // total nodes visited
  maxFiles: number;
  maxFileBytes: number;
}

export interface ShieldConfig {
  walls: Detector[];           // enabled walls (from preset)
  limits: Limits;
  /** wall ids to switch off for this call (override convenience) */
  disable?: string[];
  /** extra custom walls appended for this call */
  add?: Detector[];
}
```

### `scan()` — pure orchestrator (`domain/scan.ts`)

```ts
export function scan(surfaces: ScanSurfaces, config: ShieldConfig): ScanResult;
```

Algorithm:
1. Resolve active walls: `config.walls` minus `disable`, plus `add`.
2. Scan flat surfaces (`headers`, `query`, `pathParameters`): iterate values,
   run each value wall whose `surfaces` includes that surface. **Enforce
   `maxStringLength` before running any regex.**
3. Scan `body` with a **single safe traversal** (`domain/traversal/walk.ts`):
   one pass collects leaf strings (→ value walls) and lets structural walls
   inspect each node. Enforce `maxDepth`, `maxNodes`, `maxBodyBytes`,
   `maxStringLength`. On any cap → stop, set `truncated: true`, and record a
   `high` finding from the `oversized-payload` wall (an unscannable payload is
   treated as hostile, not silently allowed).
4. Scan `files` with `file-safety` (metadata + magic bytes only).
5. Merge findings; `verdict = findings.length ? "block" : "allow"`;
   set `highestSeverity`.

`scan()` **never throws**. Adapters decide what to do with `verdict`.

> v1 always blocks on any finding. `Verdict` is kept as an enum (not a boolean)
> so an `"allow-with-findings"` / observe mode can be added later without an API
> break — but do **not** build that mode now.

---

## 5. Walls (`domain/walls/`)

One file per wall. A wall satisfies one of two interfaces (`domain/detector.ts`):

```ts
export interface DetectorContext {
  surface: Surface;
  path: string;
}

/** Inspects individual leaf strings. */
export interface ValueDetector {
  kind: "value";
  id: string;
  severity: Severity;
  surfaces: Surface[];               // where it applies
  test(value: string, ctx: DetectorContext): boolean;
}

/** Inspects structure/shape during the body walk. */
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
  inspect(file: ScannedFile, index: number): Finding[] | null;
}

export type Detector = ValueDetector | StructuralDetector | FileDetector;
```

### Value walls
Backed by a **versioned signature table** in `domain/walls/signatures.ts`:
`{ wallId, pattern, severity }[]`, compiled to `RegExp` **once at module load**,
never per request.

| Wall | id | Detects (examples) | Default severity |
|---|---|---|---|
| SQL injection | `sqli` | `' OR 1=1`, `UNION SELECT`, `--` comment tails, stacked `;`, `xp_cmdshell` | high |
| XSS | `xss` | `<script`, `onerror=`, `javascript:`, `<iframe`, event-handler attrs | high |
| Path traversal | `path-traversal` | `../`, `..\\`, encoded `%2e%2e`, null byte `\0` | high — use plain `includes()`, not regex |
| Command injection | `command-injection` | `; rm `, `$(`, backticks, `\| sh`, `&&`, `>/dev/` | high |
| Prompt injection | `prompt-injection` | "ignore previous instructions", "disregard the above", "system prompt:", delimiter-escape, "you are now" | medium |
| Jailbreak | `jailbreak` | known jailbreak markers ("DAN", "developer mode", "do anything now"), roleplay-override phrases | medium |

Prompt-injection / jailbreak are **pattern-based**, cheap, and explicitly *not*
an LLM classifier (§10).

### Structural walls
| Wall | id | Detects | Severity |
|---|---|---|---|
| Prototype pollution | `prototype-pollution` | key ∈ `{__proto__, constructor, prototype}` at any node. Use `Object.keys` / `hasOwnProperty`; **never dereference** these keys | critical |
| Oversized payload | `oversized-payload` | any `Limits` cap tripped during traversal | high |

### File wall
`file-safety` (`domain/walls/file/`), metadata only:
- size > `maxFileBytes` → high
- filename: path traversal, null byte, double extension (`invoice.pdf.exe`) → high
- declared `mimeType` vs **magic bytes** of `head` mismatch → high
- **No regex over binary content** — that is an AV/sandbox job (§10).

---

## 6. Presets (`presets/`)

Each preset is plain data: `{ walls, limits }`, all default to block.

```ts
export interface Preset {
  walls: Detector[];
  limits: Limits;
}
```

| Preset | Intent | Walls | Notable limits |
|---|---|---|---|
| `publicApiPreset` | Hostile internet, strict | all walls | tight body/file caps |
| `internalApiPreset` | Trusted callers, looser | all walls | larger caps, may relax `xss` on non-HTML APIs |
| `batchPreset` | Large JSON bodies | all walls | high `maxBodyBytes` / `maxNodes` / `maxDepth` |
| `sqsPreset` | Queue message payloads | body-focused walls | body-only surfaces, message-sized caps |

Export a `defaultWalls` array and a `defaultLimits` object that presets compose
from, so presets differ only where they mean to.

---

## 7. Override (deep-merge)

Every adapter has the signature:

```ts
withShieldX(preset: Preset, override?: DeepPartial<ShieldConfig>): <runtime wrapper>
```

`override` deep-merges over the preset before scanning:
- `limits` — shallow-per-key merge (e.g. bump only `maxBodyBytes`)
- `disable` — array of wall ids to remove
- `add` — extra custom walls to append

```ts
// batch endpoint: bigger body, drop the size wall
withShieldFastify(batchPreset, {
  limits: { maxBodyBytes: 50_000_000 },
  disable: ["oversized-payload"],
});
```

Provide a small `resolveConfig(preset, override): ShieldConfig` helper in
`domain/` and unit-test the merge (esp. that `limits` merges per-key and `disable`
/ `add` compose). Accept `maxBodyBytes` as a number of bytes; a human-string
parser (`"50mb"`) is optional polish, not required for v1.

---

## 8. Adapters (`adapters/`)

Each adapter: (1) build `ScanSurfaces` from the runtime's request, (2) call
`scan`, (3) if `verdict === "block"` throw `ShieldBlockedError(result)`,
(4) otherwise pass through. Keep each file tiny.

- **`elysia`** — plugin using `beforeHandle`; read `request`/context. Thrown
  `ShieldBlockedError` is caught by the existing `withErrorHandler` → 403.
- **`express`** — middleware `(req, res, next)`. Map `req.headers/query/params/body`
  and multer-style `req.files`. Throw → error middleware / `ApiHandler`.
- **`fastify`** — `preHandler` hook. Map `request.headers/query/params/body`.
- **`bun`** — wraps a `(req: Request) => Response` fetch handler; parse body per
  content-type. Async because body reads are async.
- **`lambda`** — wraps an APIGW handler; map `event.headers`,
  `queryStringParameters`, `pathParameters`, parsed `body`. Throw
  `ShieldBlockedError`.
- **`sqs`** — wraps `(record) => ...`; scan `record.body` (+ message attributes).
  Throw `ShieldBlockedError` so the message fails and routes to the DLQ.

Reuse the normalized `Request` model where an adapter already has one available
(`packages/handlers/src/utils/models.ts`: `headers`, `body`, `params`, `query`,
`pathParameters`). **Files are not in that model** — adapters extract uploads
separately and pass them as `ScanSurfaces.files`.

File scanning may be async (magic-byte reads); HTTP adapters that support async
hooks should `await` it. Keep a sync `scan()` for text surfaces and an async
`scanFiles()` merged by the adapter, OR make `scan()` async — implementer's
call, but text-only scanning must stay allocation-light.

---

## 9. Error (`errors/shield-blocked-error.ts`)

Extends `ClbError` with 403 so `withErrorHandler` handles it for free. Mirror
`packages/handlers/src/errors/forbidden-error.ts`.

```ts
import ClbError from "@lucas-pmelo/handlers/errors/clb-error"; // or relative dep
import type { ScanResult } from "../domain/models";

export default class ShieldBlockedError extends ClbError {
  readonly result: ScanResult;
  constructor(result: ScanResult) {
    super(
      {
        reason: "Request blocked by shield",
        invalidParams: result.findings.map((f) => ({
          value: `${f.surface}:${f.path}`,
          reason: f.wallId,
        })),
      },
      403,
    );
    this.result = result;
  }
}
```

`toObject()` (inherited) surfaces the blocked reasons **without leaking the
payload** — `sample` is redacted/truncated and is intentionally not included in
`invalidParams`.

---

## 10. Non-goals (state in README so nobody disables real controls)

- **Not a WAF** — no rate limiting, IP reputation, bot/DDoS, TLS/network layer.
- **Not auth** — no authn/authz.
- **Not an output sanitizer** — detecting XSS on input does **not** replace
  escaping / DOMPurify at render time.
- **Not antivirus** — no deep file-content malware scanning or sandboxing.
- **Not an LLM firewall** — prompt-injection/jailbreak walls are cheap pattern
  matches, not a model-based classifier; they catch obvious attempts only.

---

## 11. Performance requirements

- Compile all signature regexes **once at module load**.
- **Enforce size caps before running any regex** — a hard per-string length cap
  plus total-byte cap is the primary ReDoS defense.
- Audit every signature for catastrophic backtracking; **no nested quantifiers**
  (`(a+)+`). Where cheap, use plain string `includes()`/`indexOf()`
  (path traversal `../`, null bytes, proto keys) instead of regex.
- **Single pass** over the body: collect leaf strings and run structural walls in
  the one traversal; never re-traverse per wall.

---

## 12. Package layout

```
packages/shield/
  src/
    domain/
      models.ts              # Surface, Severity, Verdict, ScanSurfaces, ScannedFile,
                             #   Finding, ScanResult, Limits, ShieldConfig
      detector.ts            # ValueDetector, StructuralDetector, FileDetector, Detector
      scan.ts                # scan() core + verdict policy
      resolve-config.ts      # resolveConfig(preset, override) deep-merge
      traversal/
        walk.ts              # safe body traversal
        limits.ts            # defaultLimits
      walls/
        sqli.ts  xss.ts  path-traversal.ts  command-injection.ts
        prompt-injection.ts  jailbreak.ts
        prototype-pollution.ts  oversized-payload.ts
        file/
          file-safety.ts  magic-bytes.ts  filename.ts
        signatures.ts        # versioned pattern table
        index.ts             # defaultWalls
    presets/
      public-api.ts  internal-api.ts  batch.ts  sqs.ts  index.ts
    adapters/
      elysia.ts  express.ts  fastify.ts  bun.ts  lambda.ts  sqs.ts  index.ts
    errors/
      shield-blocked-error.ts
    index.ts                 # barrel: scan, presets, withShieldX, ShieldBlockedError, models
  package.json               # "@lucas-pmelo/shield", "type": "module", main: "lib/index.js"
  tsconfig.json              # extends ../../tsconfig.json, outDir ./lib, declaration true
  tsconfig.build.json        # extends ./tsconfig.json, exclude **/*.test.ts
```

### Conventions to match (from existing packages)
- `package.json`: `"name": "@lucas-pmelo/shield"`, `"type": "module"`,
  `"main": "lib/index.js"`, `"files": ["lib"]`,
  `"publishConfig": { "access": "public" }`, version `0.1.0`.
- Scripts: `"test": "bun test --coverage"`, `"tsc": "tsc -p tsconfig.build.json"`,
  `"build": "bun run tsc"`.
- `tsconfig.json` extends `../../tsconfig.json` with
  `outDir: "./lib"`, `module: "esnext"`, `target: "es2022"`,
  `moduleResolution: "bundler"`, `declaration: true`, `types: ["bun"]`.
- Tests colocated as `*.test.ts`, run with `bun test`.
- Framework/runtime types (`elysia`, `fastify`, `express`, `aws-lambda`) go in
  `peerDependencies` + `devDependencies` so shield stays runtime-agnostic and
  installs light.

---

## 13. Implementation order

1. **`domain/models.ts` + `domain/detector.ts`** — the contracts.
2. **`domain/traversal/`** (`walk.ts`, `limits.ts`) — safe body walk with caps. Test edge cases: deep nesting, cycles, huge strings, `__proto__` keys.
3. **`domain/walls/`** — walls one at a time, each with its own `*.test.ts` of positive + negative cases. Start with `prototype-pollution` and `path-traversal` (plain-string, no ReDoS), then signature-backed value walls, then `file-safety`.
4. **`domain/scan.ts` + `resolve-config.ts`** — orchestrator + merge, with tests.
5. **`presets/`** — the four presets from shared `defaultWalls`/`defaultLimits`.
6. **`errors/shield-blocked-error.ts`**.
7. **`adapters/`** — one at a time; `elysia` and `express` first (repo already
   uses them), then `fastify`, `bun`, `lambda`, `sqs`. Each with an integration
   test proving a malicious request throws `ShieldBlockedError` and a clean one
   passes through.
8. **`index.ts` barrel** + `package.json` / tsconfig / README (with §10 non-goals).

### Definition of done
- `bun test` green with meaningful coverage per wall (positive + negative).
- Every wall has ReDoS-safe patterns and respects `maxStringLength`.
- Each adapter has an integration test (malicious → throws, clean → passes).
- README documents presets, per-endpoint override, and the non-goals.
- No dependency from `domain/` onto `adapters/` or any web framework.
```
