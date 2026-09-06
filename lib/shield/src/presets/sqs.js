"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqsPreset = void 0;
const walls_1 = require("../domain/walls");
exports.sqsPreset = {
    walls: walls_1.defaultWalls,
    limits: {
        maxBodyBytes: 256000,
        maxStringLength: 20000,
        maxDepth: 20,
        maxNodes: 10000,
        maxFiles: 1,
        maxFileBytes: 256000,
    },
};
//# sourceMappingURL=sqs.js.map