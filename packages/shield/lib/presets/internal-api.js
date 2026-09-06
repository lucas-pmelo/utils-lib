import { defaultWalls } from "../domain/walls/index.js";
export const internalApiPreset = {
    walls: defaultWalls,
    limits: {
        maxBodyBytes: 2_000_000,
        maxStringLength: 20_000,
        maxDepth: 20,
        maxNodes: 10_000,
        maxFiles: 20,
        maxFileBytes: 20_000_000,
    },
};
//# sourceMappingURL=internal-api.js.map