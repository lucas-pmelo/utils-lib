/** Percent-decoding passes attempted beyond the raw value. */
const MAX_DECODE_PASSES = 3;

/**
 * A SQL block comment. Bounded and lazy, and never itself repeated, so this
 * stays within the same backtracking budget the signature table is audited to.
 */
const SQL_BLOCK_COMMENT = /\/\*[\s\S]{0,4096}?\*\//g;

function percentDecodings(value: string): string[] {
  if (!value.includes("%")) return [];

  const decodings: string[] = [];
  let current = value;

  for (let pass = 0; pass < MAX_DECODE_PASSES; pass++) {
    if (!current.includes("%")) break;

    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      // Malformed escape — there is nothing further to decode.
      break;
    }

    if (next === current) break;
    decodings.push(next);
    current = next;
  }

  return decodings;
}

/**
 * The forms of a value a wall must see.
 *
 * Signatures match the shape an attack has when it reaches its sink, but the
 * shape in transit is not that. Two rewrites in particular arrive intact at a
 * literal pattern and mean nothing to the parser downstream:
 *
 * - **Percent-encoding.** Frameworks decode a query string once; nothing
 *   decodes headers or path segments, and nothing decodes twice. So
 *   `%252e%252e%252f` reaches a wall still encoded.
 * - **SQL comments.** `UNION/**' + '/SELECT` is whitespace to a SQL parser and
 *   an unmatched string to `\bunion\s+select\b`.
 *
 * Normalizing here rather than in the patterns keeps the signature table free
 * of the nested quantifiers that alternating over "whitespace or comment"
 * would otherwise require.
 *
 * Work is skipped when the marker is absent, so ordinary text costs two
 * `includes` calls and no allocation.
 */
export function decodedVariants(value: string): string[] {
  const variants = [value, ...percentDecodings(value)];

  for (const variant of [...variants]) {
    if (!variant.includes("/*")) continue;
    const stripped = variant.replace(SQL_BLOCK_COMMENT, " ");
    if (stripped !== variant) variants.push(stripped);
  }

  return variants;
}
