"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicApiPreset = void 0;
const walls_1 = require("../domain/walls");
exports.publicApiPreset = {
    walls: walls_1.defaultWalls,
    limits: {
        maxBodyBytes: 256000,
        maxStringLength: 4000,
        maxDepth: 10,
        maxNodes: 1000,
        maxFiles: 5,
        maxFileBytes: 2000000,
    },
};
//# sourceMappingURL=public-api.js.map