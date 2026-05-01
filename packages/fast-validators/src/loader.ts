import fs from "node:fs";
import path from "node:path";
import url from "node:url";

interface Exports {
  memory: WebAssembly.Memory;
  bufferPtr: () => number;
  bufferLen: () => number;
  isValidCPF: (len: number) => number;
  isValidCNPJ: (len: number) => number;
  isValidEmail: (len: number) => number;
  isValidPlate: (len: number) => number;
  isValidPhone: (len: number) => number;
}

const here = path.dirname(url.fileURLToPath(import.meta.url));
const wasmPath = path.resolve(here, "..", "fast_validators.wasm");
const bytes = fs.readFileSync(wasmPath);
const { instance } = await WebAssembly.instantiate(bytes, {});

export const wasm = instance.exports as unknown as Exports;

const bufPtr = wasm.bufferPtr();
const bufCap = wasm.bufferLen();

function view(): Uint8Array {
  return new Uint8Array(wasm.memory.buffer, bufPtr, bufCap);
}

export function writeDigits(input: string): number {
  const v = view();
  let n = 0;
  for (let i = 0; i < input.length && n < bufCap; i++) {
    const c = input.charCodeAt(i);
    if (c >= 48 && c <= 57) v[n++] = c;
  }
  return n;
}

// Writes raw ASCII bytes. Returns -1 if any non-ASCII char is encountered.
export function writeAscii(input: string): number {
  const v = view();
  const len = Math.min(input.length, bufCap);
  for (let i = 0; i < len; i++) {
    const c = input.charCodeAt(i);
    if (c > 0x7f) return -1;
    v[i] = c;
  }
  return len;
}

// Writes only [A-Z0-9], lowercased letters get uppercased. Used for plates.
export function writePlate(input: string): number {
  const v = view();
  let n = 0;
  for (let i = 0; i < input.length && n < bufCap; i++) {
    const c = input.charCodeAt(i);
    if (c >= 48 && c <= 57) v[n++] = c;
    else if (c >= 65 && c <= 90) v[n++] = c;
    else if (c >= 97 && c <= 122) v[n++] = c - 32;
  }
  return n;
}
