/**
 * Body text as something scannable.
 *
 * Malformed JSON is scanned as raw text rather than rejected — a payload we
 * cannot parse is exactly the payload worth looking at.
 */
export function parseBody(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
