const RESERVED_KEY = "__proto__";
function leadingName(key) {
    const bracket = key.indexOf("[");
    return bracket === -1 ? key : key.slice(0, bracket);
}
const CHAINING_KEYS = new Set(["constructor", "prototype"]);
export const prototypePollutionWall = {
    kind: "structural",
    id: "prototype-pollution",
    severity: "critical",
    inspectNode: (key, value) => {
        const name = leadingName(key);
        return (name === RESERVED_KEY ||
            (CHAINING_KEYS.has(name) && typeof value === "object" && value !== null));
    },
};
//# sourceMappingURL=prototype-pollution.js.map