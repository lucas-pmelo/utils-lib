import { wasm, writeAscii, writeDigits, writePlate } from "./loader";

export function isValidCPF(input: string): boolean {
  const len = writeDigits(input);
  return wasm.isValidCPF(len) === 1;
}

export function isValidCNPJ(input: string): boolean {
  const len = writeDigits(input);
  return wasm.isValidCNPJ(len) === 1;
}

export function isValidDocument(input: string): boolean {
  const len = writeDigits(input);
  if (len === 11) return wasm.isValidCPF(len) === 1;
  if (len === 14) return wasm.isValidCNPJ(len) === 1;
  return false;
}

export function isValidEmail(input: string): boolean {
  const trimmed = input.trim();
  const len = writeAscii(trimmed);
  if (len < 0) return false;
  return wasm.isValidEmail(len) === 1;
}

export function isValidPlate(input: string): boolean {
  const len = writePlate(input);
  return wasm.isValidPlate(len) === 1;
}

export function isValidPhone(input: string): boolean {
  const len = writeDigits(input);
  return wasm.isValidPhone(len) === 1;
}
