import { describe, expect, it } from "bun:test";
import { defaultLimits } from "./traversal/limits";
import { resolveConfig } from "./resolve-config";
import { scan } from "./scan";
import { defaultWalls } from "./walls";
import type { ShieldConfig } from "./detector";

const config: ShieldConfig = resolveConfig({ walls: defaultWalls, limits: defaultLimits });

function scanMessage(message: string): { verdict: string; walls: string[] } {
  const result = scan({ body: { message } }, config);
  return { verdict: result.verdict, walls: result.findings.map((f) => f.wallId) };
}

/**
 * False-positive suite. Every string here is ordinary product traffic. A wall
 * that blocks these does not fail loudly in CI — it fails in production, as
 * support tickets from users whose perfectly normal message was rejected.
 */
describe("scan false positives", () => {
  it.each([
    ["a code snippet in markdown backticks", "use the `map` function to iterate the list"],
    ["a transactional confirmation line", "You are now subscribed to our newsletter"],
    ["a plain-text email signature delimiter", "Thanks for your help,\n--"],
    ["a support request naming a product setting", "Please enable developer mode in settings"],
    ["marketing copy about unlimited usage", "Stream without any limits on the Pro plan"],
    ["a news headline about phone jailbreaking", "How to jailbreak your old iPhone in 2026"],
  ])("should allow %s", (_label, message) => {
    expect(scanMessage(message)).toEqual({ verdict: "allow", walls: [] });
  });

  /**
   * Accepted false positives, kept as cases so the trade stays visible.
   *
   * Both spellings are the textbook form of a real attack — `<svg onload=…>`
   * and `UNION SELECT`. Narrowing either pattern enough to let this prose
   * through would cost more than the occasional rejected sentence does.
   */
  it.each([
    ["a bug report mentioning an svg asset", "I attached an <svg> logo to the ticket", "xss"],
    ["a labour union committee", "The union select committee meets on Friday", "sqli"],
  ])("should knowingly block %s", (_label, message, wallId) => {
    expect(scanMessage(message)).toEqual({ verdict: "block", walls: [wallId] });
  });
});
