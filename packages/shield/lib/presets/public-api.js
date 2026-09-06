import { defaultWalls } from "../domain/walls";
export const publicApiPreset = {
    walls: defaultWalls,
    limits: {
        maxBodyBytes: 256_000,
        maxStringLength: 4_000,
        maxDepth: 10,
        maxNodes: 1_000,
        maxFiles: 5,
        maxFileBytes: 2_000_000,
    },
};
//# sourceMappingURL=public-api.js.map