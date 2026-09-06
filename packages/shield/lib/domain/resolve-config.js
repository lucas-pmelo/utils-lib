export function resolveConfig(preset, override = {}) {
    return {
        walls: override.walls ?? preset.walls,
        limits: { ...preset.limits, ...override.limits },
        disable: override.disable,
        add: override.add,
    };
}
//# sourceMappingURL=resolve-config.js.map