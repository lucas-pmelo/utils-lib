import { MAGIC_HEAD_BYTES } from "../domain/walls/file/magic-bytes.js";
import type { ScannedFile } from "../domain/models.js";

/** The multer upload shape, declared structurally so multer stays out of the deps. */
export interface MulterLikeFile {
  originalname: string;
  mimetype?: string;
  size: number;
  buffer?: Uint8Array;
}

function toScannedFile(file: MulterLikeFile): ScannedFile {
  return {
    filename: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    ...(file.buffer && { head: file.buffer.subarray(0, MAGIC_HEAD_BYTES) }),
  };
}

/** Normalizes the three shapes multer can leave on a request into one list. */
export function toScannedFiles(
  single: MulterLikeFile | undefined,
  many: MulterLikeFile[] | Record<string, MulterLikeFile[]> | undefined,
): ScannedFile[] | undefined {
  const uploads: MulterLikeFile[] = [];
  if (single) uploads.push(single);
  if (Array.isArray(many)) uploads.push(...many);
  else if (many) uploads.push(...Object.values(many).flat());

  return uploads.length ? uploads.map(toScannedFile) : undefined;
}
