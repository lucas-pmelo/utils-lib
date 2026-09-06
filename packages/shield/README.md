# @lucas-pmelo/shield

Framework-agnostic request scanner. It inspects every entry surface of an
incoming request — headers, query string, path parameters, body and uploads —
and **blocks** input matching known attack patterns: SQL injection, XSS, path
traversal, command injection, prototype pollution, oversized payloads and
unsafe file uploads. Prompt injection and jailbreak strings are covered by
[opt-in walls](#llm-walls).

Keys are scanned as well as values, on every surface: a key reaches a sink as
readily as a value does. Values are also scanned in their decoded forms, so a
double-encoded payload or a SQL comment wedged between keywords is matched.

It is a layer of defense-in-depth at the edge, not a replacement for real
controls. Read [Non-goals](#non-goals) before you turn anything else off.

## Install

```sh
bun add @lucas-pmelo/shield
```

No runtime dependencies. Adapters are duck-typed against each runtime's request
shape, so nothing pulls Elysia, Express, Fastify or the AWS SDK into your tree.

## Use

Pick a preset, wrap your handler:

```ts
import { withShieldElysia, publicApiPreset } from "@lucas-pmelo/shield";

app.onBeforeHandle(withShieldElysia(publicApiPreset));
```

A blocked request throws `ShieldBlockedError`, which extends the `ClbError`
contract with status 403. The `withErrorHandler` and `ApiHandler` helpers in
`@lucas-pmelo/handlers` branch on `isTreated`, so they answer 403 for free.

### Adapters

| Runtime | Wrapper | Shape |
|---|---|---|
| Elysia | `withShieldElysia` | `beforeHandle` hook |
| Express | `withShieldExpress` | `(req, res, next)` middleware |
| Fastify | `withShieldFastify` | async `preHandler` hook |
| Bun | `withShieldBun` | wraps a `(req: Request) => Response` fetch handler |
| Lambda | `withShieldLambda` | wraps an API Gateway handler |
| SQS | `withShieldSqs` | wraps a per-record handler; a block sends the message to the DLQ |

Every adapter throws `ShieldBlockedError` on a block, except Bun: that wrapper
*is* the fetch handler, so it answers a 403 response directly — an escaping
throw would reach `Bun.serve` as a 500.

**Uploads are scanned on Express and Bun only.** Those two adapters build a
`files` surface, from multer and from `formData` respectively; the Fastify,
Elysia and Lambda adapters do not, so `file-safety` inspects nothing there.
Scan uploads yourself with `scan({ files })` if you need them covered on those
runtimes.

Adding a runtime is one new adapter file: build a `ScanSurfaces`, call `guard`.
The core never changes.

## Presets

Each preset is plain data — `{ walls, limits }` — and every preset enables the
same walls: `defaultWalls`, which is every wall except the two
[LLM walls](#llm-walls). They differ only in their caps.

| Preset | Intent | `maxBodyBytes` | `maxStringLength` | `maxDepth` | `maxNodes` | `maxFiles` | `maxFileBytes` |
|---|---|---|---|---|---|---|---|
| `publicApiPreset` | Hostile internet, strict | 256 KB | 4 000 | 10 | 1 000 | 5 | 2 MB |
| `internalApiPreset` | Trusted callers, roomier | 2 MB | 20 000 | 20 | 10 000 | 20 | 20 MB |
| `batchPreset` | Large JSON bodies | 20 MB | 50 000 | 40 | 200 000 | 20 | 20 MB |
| `sqsPreset` | Queue messages | 256 KB | 20 000 | 20 | 10 000 | 1 | 256 KB |

`maxBodyBytes` and `maxStringLength` count UTF-16 code units, which equals bytes
for ASCII. They are a denial-of-service guard, not an accounting figure.

## Per-endpoint override

Every wrapper takes a second argument that deep-merges over the preset.
`limits` merges per key, so you restate only what you are changing.

```ts
// Batch endpoint: bigger bodies, without giving up the truncation check.
app.post("/import", withShieldFastify(batchPreset, {
  limits: { maxBodyBytes: 50_000_000, maxNodes: 500_000 },
}));
```

> **Raising a cap is not the same as disabling `oversized-payload`.** The walk
> stops at the first cap it trips, so everything after an oversized field goes
> unscanned. With the wall on, that is reported and the request is blocked;
> with it disabled, the request is allowed and the rest of the payload was
> never looked at. Prefer raising the cap.

| Key | Effect |
|---|---|
| `limits` | Per-key merge over the preset's caps |
| `disable` | Wall ids to switch off for this endpoint |
| `add` | Extra custom walls appended for this endpoint |
| `walls` | Replaces the preset's wall list outright |

A custom wall is any object satisfying `ValueDetector`, `StructuralDetector` or
`FileDetector`:

```ts
const noEmoji: ValueDetector = {
  kind: "value",
  id: "no-emoji",
  severity: "low",
  surfaces: ["body"],
  test: (value) => /\p{Extended_Pictographic}/u.test(value),
};

withShieldExpress(publicApiPreset, { add: [noEmoji] });
```

## Walls

`defaultWalls`, on in every preset:

| Wall | id | Severity | Kind | Surfaces |
|---|---|---|---|---|
| SQL injection | `sqli` | high | value | all |
| XSS | `xss` | high | value | all |
| Path traversal | `path-traversal` | high | value | all but the body |
| Command injection | `command-injection` | high | value | all |
| Prototype pollution | `prototype-pollution` | critical | structural | all |
| Oversized payload | `oversized-payload` | high | structural | all |
| File safety | `file-safety` | high | file | uploads |

`path-traversal` skips the body because `../` is prose in a bug report, while a
traversal that matters arrives in a path segment, a query parameter or a
filename. Uploads stay covered — `file-safety` checks the same markers there.

`prototype-pollution` always blocks `__proto__`. It blocks `constructor` and
`prototype` only when the value is a nested object, which is the merge shape:
`{ prototype: "v1" }` is a product record, not an attack.

Any finding blocks — v1 has no observe mode. `Verdict` is an enum rather than a
boolean so one can be added later without an API break.

### LLM walls

`prompt-injection` and `jailbreak` are **off by default** and shipped as
`llmWalls`. Turn them on where a field actually reaches a model:

```ts
import { llmWalls, publicApiPreset, withShieldElysia } from "@lucas-pmelo/shield";

app.post("/chat", withShieldElysia(publicApiPreset, { add: [...llmWalls] }));
```

They match natural language, and natural language is what a free-text field
holds. Mounted on every field of an API that talks to no model they are a
false-positive engine guarding nothing: "you are now subscribed to our
newsletter" and "how to jailbreak your old iPhone" are ordinary product copy.
Even scoped to an LLM endpoint they are a speed bump, not a control — see
[Non-goals](#non-goals).

## Using the core directly

```ts
import { scan, resolveConfig, publicApiPreset } from "@lucas-pmelo/shield";

const result = scan({ body: req.body }, resolveConfig(publicApiPreset));
// { verdict, findings, highestSeverity, truncated }
```

`scan` is pure and never throws. It knows nothing about HTTP; adapters decide
what a verdict means.

### Safety properties

- Every signature is compiled once at module load, never per request.
- Size caps are enforced **before** any regex runs — the primary ReDoS defense.
- No signature contains a nested quantifier; a test asserts this over the whole
  table, and a second one asserts the table matches a worst-case string in
  bounded time.
- Path traversal and prototype pollution use plain string checks, not regex.
- Decoding and comment-stripping happen once in `normalize`, not in the
  patterns, which is what keeps the table free of nested quantifiers.
- Every surface is traversed **once**; value and structural walls share the
  pass, and keys are scanned as values.
- Binary values (`Uint8Array`, `ArrayBuffer`) are leaves, not containers, so an
  upload in the body cannot spend a node per byte.
- A payload too deep, too large or cyclic to scan is reported as `truncated`,
  and blocked while `oversized-payload` is enabled. **Disabling that wall makes
  truncation silent:** the walk still stops at the first tripped cap, so the
  remainder of the payload is neither scanned nor reported. It is the one
  switch that can turn a block into an unexamined allow.
- Prototype pollution matches on the key alone and never dereferences it.
- `Finding.sample` is truncated to 32 characters with digit runs masked, and is
  deliberately **not** included in the 403 body.

## Non-goals

State these before anyone disables a real control on shield's account.

- **Not a WAF.** No rate limiting, IP reputation, bot or DDoS handling, nothing
  at the TLS or network layer.
- **Not auth.** No authentication, no authorization.
- **Not an output sanitizer.** Detecting XSS on input does not replace escaping
  or DOMPurify at render time.
- **Not antivirus.** File checks are metadata only — size, filename, and magic
  bytes against the declared type. No content scanning, no sandboxing.
- **Not an LLM firewall.** The prompt-injection and jailbreak walls are cheap
  pattern matches, not a model-based classifier. They catch obvious attempts
  and nothing more, which is why they are opt-in rather than on by default.
- **Not a normalizer for every encoding.** Percent-encoding and SQL block
  comments are decoded before matching. Unicode homoglyphs, HTML entities and
  charset tricks are not.

## Test

```sh
bun test --coverage
```
