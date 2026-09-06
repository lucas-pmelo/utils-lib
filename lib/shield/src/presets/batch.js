"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchPreset = void 0;
const walls_1 = require("../domain/walls");
exports.batchPreset = {
    walls: walls_1.defaultWalls,
    limits: {
        maxBodyBytes: 20000000,
        maxStringLength: 50000,
        maxDepth: 40,
        maxNodes: 200000,
        maxFiles: 20,
        maxFileBytes: 20000000,
    },
};
//# sourceMappingURL=batch.js.map