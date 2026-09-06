import { defaultWalls } from "../domain/walls/index.js";
export const batchPreset = {
    walls: defaultWalls,
    limits: {
        maxBodyBytes: 20_000_000,
        maxStringLength: 50_000,
        maxDepth: 40,
        maxNodes: 200_000,
        maxFiles: 20,
        maxFileBytes: 20_000_000,
    },
};
//# sourceMappingURL=batch.js.map