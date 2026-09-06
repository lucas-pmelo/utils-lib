"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signatures = exports.SIGNATURE_TABLE_VERSION = void 0;
exports.signaturesFor = signaturesFor;
exports.SIGNATURE_TABLE_VERSION = 1;
exports.signatures = [
    { wallId: "sqli", pattern: /'\s*(or|and)\s+\d+\s*=\s*\d+/i },
    { wallId: "sqli", pattern: /\b(or|and)\s+\d+\s*=\s*\d+\s*(--|#|;|$)/i },
    { wallId: "sqli", pattern: /'\s*(or|and)\s+'[^']{0,40}'\s*=\s*'/i },
    { wallId: "sqli", pattern: /\bunion\s+(all\s+)?select\b/i },
    { wallId: "sqli", pattern: /'\s*(--|#)/ },
    { wallId: "sqli", pattern: /--\s*$/ },
    { wallId: "sqli", pattern: /;\s*(drop|delete|insert|update|truncate|alter|create)\b/i },
    { wallId: "sqli", pattern: /\bxp_cmdshell\b/i },
    { wallId: "sqli", pattern: /\b(sleep|benchmark|pg_sleep|waitfor\s+delay)\s*\(/i },
    { wallId: "sqli", pattern: /\binformation_schema\b/i },
    { wallId: "xss", pattern: /<script\b/i },
    { wallId: "xss", pattern: /<iframe\b/i },
    { wallId: "xss", pattern: /<svg\b/i },
    { wallId: "xss", pattern: /<object\b/i },
    { wallId: "xss", pattern: /<embed\b/i },
    { wallId: "xss", pattern: /javascript\s*:/i },
    { wallId: "xss", pattern: /\bon(error|load|click|mouseover|focus|submit|toggle)\s*=/i },
    { wallId: "xss", pattern: /\bdocument\s*\.\s*cookie\b/i },
    {
        wallId: "command-injection",
        pattern: /[;&|]{1,2}\s*(rm|cat|ls|curl|wget|nc|ncat|bash|sh|zsh|python|perl|ruby|chmod|chown|kill|shutdown|reboot|mkfs|dd|whoami|id)\b/i,
    },
    { wallId: "command-injection", pattern: /\$\(/ },
    { wallId: "command-injection", pattern: /`[^`\n]{0,64}`/ },
    { wallId: "command-injection", pattern: />\s*\/dev\// },
    { wallId: "command-injection", pattern: /\/etc\/(passwd|shadow)\b/ },
    {
        wallId: "prompt-injection",
        pattern: /\bignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|preceding|earlier)\s+(instructions?|prompts?|rules?|directions?|messages?)/i,
    },
    {
        wallId: "prompt-injection",
        pattern: /\bdisregard\s+(all\s+|any\s+|the\s+)?(previous|prior|above|preceding|earlier)\b/i,
    },
    { wallId: "prompt-injection", pattern: /\bsystem\s+prompt\s*[:=]/i },
    { wallId: "prompt-injection", pattern: /\byou\s+are\s+now\b/i },
    { wallId: "prompt-injection", pattern: /<\|(im_start|im_end|system|user|assistant|endoftext)\|>/i },
    { wallId: "prompt-injection", pattern: /\[\/?(INST|SYS)\]/ },
    { wallId: "prompt-injection", pattern: /\bforget\s+(everything|all\s+(previous|prior))\b/i },
    {
        wallId: "prompt-injection",
        pattern: /\breveal\s+(your|the)\s+(system\s+)?(prompt|instructions)/i,
    },
    { wallId: "prompt-injection", pattern: /\bnew\s+instructions\s*:/i },
    { wallId: "jailbreak", pattern: /\bdan\s+mode\b/i },
    { wallId: "jailbreak", pattern: /\bdo\s+anything\s+now\b/i },
    {
        wallId: "jailbreak",
        pattern: /\b(enable|enter|activate|switch\s+to|in)\s+developer\s+mode\b/i,
    },
    { wallId: "jailbreak", pattern: /\bjailbreak\b/i },
    {
        wallId: "jailbreak",
        pattern: /\bpretend\s+(you\s+are|to\s+be)\s+(an?\s+)?(unrestricted|unfiltered|uncensored|amoral|evil)\b/i,
    },
    {
        wallId: "jailbreak",
        pattern: /\bwithout\s+(any\s+)?(restrictions?|filters?|censorship|limits?|ethical\s+guidelines|moral\s+guidelines)\b/i,
    },
];
const BY_WALL_ID = new Map();
for (const signature of exports.signatures) {
    const bucket = BY_WALL_ID.get(signature.wallId);
    if (bucket)
        bucket.push(signature.pattern);
    else
        BY_WALL_ID.set(signature.wallId, [signature.pattern]);
}
const NONE = [];
function signaturesFor(wallId) {
    var _a;
    return (_a = BY_WALL_ID.get(wallId)) !== null && _a !== void 0 ? _a : NONE;
}
//# sourceMappingURL=signatures.js.map