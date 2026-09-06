"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqliWall = void 0;
const signature_wall_1 = require("./signature-wall");
const surfaces_1 = require("./surfaces");
exports.sqliWall = (0, signature_wall_1.createSignatureWall)("sqli", "high", surfaces_1.ALL_SURFACES);
//# sourceMappingURL=sqli.js.map