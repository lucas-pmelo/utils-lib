/**
 * Versioned attack-signature table.
 *
 * Every pattern is a literal, so the whole table is compiled once when this
 * module loads and never recompiled per request. Patterns are audited for
 * catastrophic backtracking: no group that contains an unbounded quantifier is
 * itself unboundedly repeated, and every wildcard span is explicitly bounded.
 * Bump the version whenever a pattern changes.
 *
 * Patterns match plain keyword gaps only. Evasions that rewrite the gap — a
 * SQL comment between UNION and SELECT, a percent-encoded payload — are
 * handled once in `normalize`, which hands every wall the decoded forms as
 * well as the raw one. Keeping that out of the table is what lets every
 * pattern here stay free of nested quantifiers.
 */
export const SIGNATURE_TABLE_VERSION = 2;

export interface Signature {
  wallId: string;
  pattern: RegExp;
}

export const signatures: readonly Signature[] = [
  // --- sqli ---------------------------------------------------------------
  { wallId: "sqli", pattern: /'\s*(or|and)\s+\d+\s*=\s*\d+/i },
  { wallId: "sqli", pattern: /\b(or|and)\s+\d+\s*=\s*\d+\s*(--|#|;|$)/i },
  { wallId: "sqli", pattern: /'\s*(or|and)\s+'[^']{0,40}'\s*=\s*'/i },
  { wallId: "sqli", pattern: /\bunion\s+(all\s+)?select\b/i },
  { wallId: "sqli", pattern: /'\s*(--|#)/ },
  { wallId: "sqli", pattern: /;\s*(drop|delete|insert|update|truncate|alter|create)\b/i },
  { wallId: "sqli", pattern: /\bxp_cmdshell\b/i },
  { wallId: "sqli", pattern: /\b(sleep|benchmark|pg_sleep|waitfor\s+delay)\s*\(/i },
  { wallId: "sqli", pattern: /\binformation_schema\b/i },

  // --- xss ----------------------------------------------------------------
  { wallId: "xss", pattern: /<script\b/i },
  { wallId: "xss", pattern: /<iframe\b/i },
  { wallId: "xss", pattern: /<svg\b/i },
  { wallId: "xss", pattern: /<object\b/i },
  { wallId: "xss", pattern: /<embed\b/i },
  { wallId: "xss", pattern: /javascript\s*:/i },
  { wallId: "xss", pattern: /\bon(error|load|click|mouseover|focus|submit|toggle)\s*=/i },
  { wallId: "xss", pattern: /\bdocument\s*\.\s*cookie\b/i },

  // --- command-injection --------------------------------------------------
  {
    wallId: "command-injection",
    pattern:
      /[;&|]{1,2}\s*(rm|cat|ls|curl|wget|nc|ncat|bash|sh|zsh|python|perl|ruby|chmod|chown|kill|shutdown|reboot|mkfs|dd|whoami|id)\b(?=\s*$|\s*[;&|]|\s+[-\/~.$'"]|\s+\w{1,16}:\/\/)/i,
  },
  // A bare `$(` is a currency amount as often as a substitution, and a bare
  // backtick pair is markdown. Both require something shell-shaped inside.
  { wallId: "command-injection", pattern: /\$\(\s*[a-z_.\/]/i },
  {
    wallId: "command-injection",
    pattern:
      /`\s*(\/(bin|usr|sbin|etc)\/|rm|cat|curl|wget|nc|ncat|bash|sh|zsh|python|perl|ruby|chmod|chown|kill|whoami|uname|eval|export)\b[^`\n]{0,64}`/i,
  },
  { wallId: "command-injection", pattern: />\s*\/dev\// },
  { wallId: "command-injection", pattern: /\/etc\/(passwd|shadow)\b/ },

  // --- prompt-injection ---------------------------------------------------
  {
    wallId: "prompt-injection",
    pattern:
      /\bignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|preceding|earlier)\s+(instructions?|prompts?|rules?|directions?|messages?)/i,
  },
  {
    wallId: "prompt-injection",
    pattern: /\bdisregard\s+(all\s+|any\s+|the\s+)?(previous|prior|above|preceding|earlier)\b/i,
  },
  { wallId: "prompt-injection", pattern: /\bsystem\s+prompt\s*[:=]/i },
  {
    wallId: "prompt-injection",
    pattern:
      /\byou\s+are\s+now\s+(in\s+)?(dan\b|developer\s+mode|jailbroken|unrestricted|unfiltered|uncensored|free\s+from|no\s+longer\s+bound|an?\s+(unrestricted|unfiltered|uncensored|evil|amoral)\b)/i,
  },
  { wallId: "prompt-injection", pattern: /<\|(im_start|im_end|system|user|assistant|endoftext)\|>/i },
  { wallId: "prompt-injection", pattern: /\[\/?(INST|SYS)\]/ },
  { wallId: "prompt-injection", pattern: /\bforget\s+(everything|all\s+(previous|prior))\b/i },
  {
    wallId: "prompt-injection",
    pattern: /\breveal\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
  },
  { wallId: "prompt-injection", pattern: /\bnew\s+instructions\s*:/i },

  // --- jailbreak ----------------------------------------------------------
  { wallId: "jailbreak", pattern: /\bdan\s+mode\b/i },
  { wallId: "jailbreak", pattern: /\bdo\s+anything\s+now\b/i },
  {
    wallId: "jailbreak",
    pattern: /\b(enable|enter|activate|switch\s+to|in)\s+developer\s+mode\b/i,
  },
  {
    wallId: "jailbreak",
    pattern: /\bjailbreak(ing)?\s+(the\s+|this\s+|your\s+)?(ai|model|assistant|bot|gpt|llm|chatbot|prompt|system)\b/i,
  },
  { wallId: "jailbreak", pattern: /\bjailbroken\s+(mode|ai|model|assistant)\b/i },
  {
    wallId: "jailbreak",
    pattern:
      /\bpretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(unrestricted|unfiltered|uncensored|amoral|evil)\b/i,
  },
  {
    wallId: "jailbreak",
    pattern:
      /\bwithout\s+(any\s+)?(censorship|filters?|ethical\s+guidelines|moral\s+guidelines)\b/i,
  },
  {
    wallId: "jailbreak",
    pattern: /\b(respond|answer|reply|act|behave)\s+without\s+(any\s+)?(restrictions?|limits?|filters?)\b/i,
  },
];

const BY_WALL_ID = new Map<string, RegExp[]>();
for (const signature of signatures) {
  const bucket = BY_WALL_ID.get(signature.wallId);
  if (bucket) bucket.push(signature.pattern);
  else BY_WALL_ID.set(signature.wallId, [signature.pattern]);
}

const NO_PATTERNS: readonly RegExp[] = [];

/** Patterns for one wall, resolved from the table compiled at module load. */
export function signaturesFor(wallId: string): readonly RegExp[] {
  return BY_WALL_ID.get(wallId) ?? NO_PATTERNS;
}
