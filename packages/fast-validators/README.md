# @lucas-pmelo/fast-validators

Fast validators for Brazilian documents (CPF, CNPJ), email, plates (classic + Mercosul) and BR phone numbers, implemented in **Zig**, compiled to **WebAssembly**, with a thin TypeScript wrapper and Zod adapters.

## Why

Validation logic is small but runs on every API request. Pushing it into a tiny `.wasm` blob keeps it allocation-free and out of the JS GC path.

## Install

```bash
bun add @lucas-pmelo/fast-validators
```

## Usage

```ts
import {
  isValidCPF,
  isValidCNPJ,
  isValidDocument,
  isValidEmail,
  isValidPlate,
  isValidPhone,
} from "@lucas-pmelo/fast-validators";

isValidCPF("111.444.777-35"); // true
isValidCNPJ("11.222.333/0001-81"); // true
isValidDocument("111.444.777-35"); // true (auto-detects CPF or CNPJ)
isValidEmail("lucas@gmail.com"); // true
isValidPlate("ABC-1234"); // true (classic)
isValidPlate("ABC1B23"); // true (Mercosul)
isValidPhone("(11) 93333-4444"); // true
isValidPhone("+55 11 93333-4444"); // true (with country code)
```

### Zod adapter

```ts
import { z } from "zod";
import { cpf, cnpj, document, email, plate, phone } from "@lucas-pmelo/fast-validators/zod";

const schema = z.object({
  document: document(),
  email: email(),
  plate: plate(),
  phone: phone(),
});
```

## Building from source

Requires Zig 0.16+.

```bash
bun run build:wasm       # compile zig -> wasm32-freestanding
bun run build:wasm:test  # run zig unit tests (native)
bun run tsc              # build TS wrapper
```

## How it works

- `zig/src/root.zig` — pure Zig implementation. Inputs are written into a fixed 256-byte static buffer; each validator returns `0` or `1`.
- `src/loader.ts` — instantiates the wasm module once at import time, exposes `writeDigits` (digits only), `writePlate` (alphanumeric, uppercased) and `writeAscii` (raw ASCII, used for email).
- `src/index.ts` — public API.
- `src/zod.ts` — `z.string().refine(...)` wrappers.
