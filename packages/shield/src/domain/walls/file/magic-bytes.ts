/**
 * Leading bytes an adapter must capture for `detectMimeFromMagic` to work.
 *
 * Owned here because this module owns the table it is derived from: a longer
 * signature bumps this constant and every adapter follows.
 */
export const MAGIC_HEAD_BYTES = 64;

interface MagicSignature {
  mimeType: string;
  bytes: number[];
}

const SIGNATURES: MagicSignature[] = [
  { mimeType: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { mimeType: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mimeType: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mimeType: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] },
  { mimeType: "application/zip", bytes: [0x50, 0x4b, 0x03, 0x04] },
  { mimeType: "application/gzip", bytes: [0x1f, 0x8b] },
  { mimeType: "application/x-msdownload", bytes: [0x4d, 0x5a] },
  { mimeType: "application/x-elf", bytes: [0x7f, 0x45, 0x4c, 0x46] },
];

/**
 * The real type of a file, read from its leading bytes.
 *
 * Metadata only — this never scans file content for malware, which is an
 * antivirus job and an explicit non-goal.
 */
export function detectMimeFromMagic(head: Uint8Array): string | undefined {
  return SIGNATURES.find(
    (signature) =>
      head.length >= signature.bytes.length &&
      signature.bytes.every((byte, index) => head[index] === byte),
  )?.mimeType;
}
