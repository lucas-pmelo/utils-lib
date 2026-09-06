---
id: utils-lib
scope: local
confidence: seed
updated: 2026-09-05
---

# utils-lib — local overlay

Monorepo of published npm packages under `@lucas-pmelo/*`. Every package is
standalone: its own `package.json`, its own `node_modules`, its own `tsconfig.json`.

Only what **diverges from the global base** or is specific to this repo is recorded here.

## Commands

Run every command **from inside the package**, never from the root.

| Goal | Command | Verified |
|---|---|---|
| Test | `cd packages/<pkg> && bun test --coverage` | ✅ handlers, logger, validator, fast-validators |
| Typecheck / build | `cd packages/<pkg> && bun run tsc` | ✅ fast-validators, exit 0 |
| Build wasm (fast-validators only) | `bun run build:wasm` (requires `zig`) | ⚠️ not run — zig not verified |
| Lint / format | **does not exist** | — |

## The runner is `bun test`, and the root `test` script is dead

**Rule:** run tests with `bun test` inside the package. Ignore the root `scripts.test`
(`jest --coverage`) — jest is in no `package.json` and on no PATH; the script exits 127.

**Why:** this resolves the ambiguity the global `stack.md` left open for this repo
("Jest, despite `@types/bun` — confirm before touching"). It is Bun. There is no Jest here,
and adding a Jest config to make the root script work would be inventing a decision.

**✅** `cd packages/handlers && bun test --coverage`
**❌** `bun run test` at the root → `jest: command not found`

_Evidence: package.json:6 (`"test": "jest --coverage"`) vs packages/handlers/package.json (`"test": "bun test --coverage"`); verified by running both, 2026-09-05._

## This is not a workspace — install per package

**Rule:** the root `package.json` has **no `workspaces` key**. Dependencies install per
package. Before running anything in a package, check that `packages/<pkg>/node_modules`
exists; if not, `cd` in and `bun install`.

**Why:** `packages/lambda-handlers` currently has no `node_modules`, so its suite fails with
`Cannot find module '@lucas-pmelo/logger'`. That is a missing install, **not a bug in the code** —
chasing it as a code defect wastes the session.

_Evidence: package.json has no `workspaces`; `packages/lambda-handlers/` and `packages/aws-wrappers/` have no `node_modules`._

## Double quotes here, not single

**Rule:** use double quotes in this repo. This **overrides** the global `singleQuote: true` rule.

**Why:** there is no `.prettierrc` and no ESLint config anywhere in this repo, so nothing
reformats on save. The global rule cites `.prettierrc` from *other* repos; it does not apply here.
Writing single-quoted code creates diff noise against the surrounding files.

Single quotes survive in exactly one legacy cluster — the `errors/` folders of both handler
packages. Leave them alone unless already editing the file for another reason; a
quote-only rewrite is diff noise with no benefit.

**✅** `import ClbError from "./errors/clb-error";`

_Evidence: 98 double-quoted vs 31 single-quoted import specifiers; all 31 are under `packages/*/src/errors/`. See handlers/src/index.ts:1 (double) vs handlers/src/errors/not-found-error.ts:1 (single)._

## Build output `lib/` is committed on purpose

**Rule:** `packages/*/lib/` and `packages/fast-validators/fast_validators.wasm` are tracked in
git. Do not add them to `.gitignore`, and do not delete them "to clean up".

**Why:** these are published packages (`main: lib/index.js`, `files: ["lib"]`) and are also
consumed straight from the git URL. Untracking `lib/` breaks every consumer that installs from git.
It reads like a mistake, so it is worth stating that it is not.

_Evidence: 141 files tracked under `packages/*/lib/`; `packages/fast-validators/fast_validators.wasm` tracked; `.gitignore` ignores `node_modules/` but never `lib/`._

## `handlers` and `lambda-handlers` are a fork — change both

**Rule:** `packages/lambda-handlers/src` is a byte-identical copy of `packages/handlers/src`,
minus `elysia-handler.ts`. Touching a shared file (`api.ts`, `errors/*`, `utils/*`) means applying
the same change to both packages, or deliberately deciding they diverge — and saying so.

**Why:** they have already drifted: `elysia-handler.ts` exists only in `handlers`. Silent drift is
how a fix lands in one published package and not the other.

_Evidence: `diff -rq handlers/src lambda-handlers/src` → only `elysia-handler.ts` and `index.ts` differ; `api.ts` is identical._

## An HTTP error is one file, one class, extending `ClbError`

**Rule:** every HTTP error is its own file under `errors/`, `export default class`, extending
`ClbError`, passing its status code to `super`, with the class name as the default message.
Then re-export it from `src/index.ts` as `export { default as XError }`.

**Why:** `withErrorHandler` and `ApiHandler` branch on `error.isTreated`, which only `ClbError`
sets. An error thrown outside this hierarchy silently becomes a 500.

**✅**
```ts
import ClbError from './clb-error';

export default class NotFoundError extends ClbError {
  constructor(message: string = 'NotFoundError') {
    super({ reason: message }, 404);
  }
}
```
**❌** `throw new Error('not found')` inside a handler → falls through to the 500 branch.

_Evidence: handlers/src/errors/not-found-error.ts:3-11; clb-error.ts:11-22 (`isTreated = true`); elysia-handler.ts:17 and api.ts:22 (both branch on `isTreated`)._

## Classes default-export, helper functions named-export

**Rule:** a class (`ClbError` and subclasses, `Logger`) is a `export default`. A pure helper
(`removeEmpty`, `parseRequest`, `isValidCPF`, `createResponse`) is a **named** export. The package
`src/index.ts` is a barrel that normalises everything to named exports.

**Why:** consumers import `{ NotFoundError, isValidCPF }` from the package root; the barrel is the
public API, and the default/named split inside is invisible to them.

_Evidence: handlers/src/index.ts:3-16 (`export { default as ... }`) vs :1-2 and :17 (named/`export *`); fast-validators/src/index.ts:3 (named function)._

## Open — not yet a pattern

- **Test naming.** 12 of 13 test files use the global `should <result> when <condition>` style.
  `fast-validators/src/index.test.ts` is the sole outlier (36 tests, verb-first: `it('accepts a valid CPF')`)
  and is also the newest code. One file is coincidence, not a pattern — the global rule still stands
  until Lucas says the new style is intentional.
- **`bun:test` import.** 11 of 13 files import `{ describe, expect, it }` from `"bun:test"` explicitly;
  the two `errors/errors.test.ts` rely on globals. Explicit import looks like the convention, but the
  two holdouts are also the two oldest files, so this may just be age.
