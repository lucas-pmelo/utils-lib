/** Spellings clients actually send for a type the magic table names once. */
const ALIASES = new Map([
  ["image/jpg", "image/jpeg"],
  ["image/pjpeg", "image/jpeg"],
  ["application/x-zip", "application/zip"],
  ["application/x-zip-compressed", "application/zip"],
  ["application/x-gzip", "application/gzip"],
]);

/**
 * Types that are a ZIP container on disk.
 *
 * Magic bytes resolve the container, not the format inside it, so every one of
 * these reads as `application/zip`. Blocking on that mismatch would reject
 * every `.docx` an ordinary user uploads.
 */
const ZIP_CONTAINERS = /^application\/(vnd\.openxmlformats-officedocument\.|vnd\.oasis\.opendocument\.|java-archive|epub\+zip|vnd\.android\.package-archive|x-ipynb\+json)/i;

/** Drops `; charset=binary` and the like, then folds known spellings together. */
function canonical(mimeType: string): string {
  const bare = mimeType.split(";")[0]!.trim().toLowerCase();
  return ALIASES.get(bare) ?? bare;
}

/**
 * Whether the declared type can honestly describe the bytes seen.
 *
 * A finding here should mean "this file is lying about what it is", not "these
 * two strings differ".
 */
export function isMimeCompatible(declared: string, detected: string): boolean {
  const declaredType = canonical(declared);
  if (declaredType === detected) return true;

  return detected === "application/zip" && ZIP_CONTAINERS.test(declaredType);
}
