import { defaultWalls } from "../domain/walls";
export const sqsPreset = {
    walls: defaultWalls,
    limits: {
        maxBodyBytes: 256_000,
        maxStringLength: 20_000,
        maxDepth: 20,
        maxNodes: 10_000,
        maxFiles: 1,
        maxFileBytes: 256_000,
    },
};
//# sourceMappingURL=sqs.js.map