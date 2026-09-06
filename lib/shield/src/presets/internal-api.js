"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalApiPreset = void 0;
const walls_1 = require("../domain/walls");
exports.internalApiPreset = {
    walls: walls_1.defaultWalls,
    limits: {
        maxBodyBytes: 2000000,
        maxStringLength: 20000,
        maxDepth: 20,
        maxNodes: 10000,
        maxFiles: 20,
        maxFileBytes: 20000000,
    },
};
//# sourceMappingURL=internal-api.js.map