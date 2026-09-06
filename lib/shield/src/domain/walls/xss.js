"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xssWall = void 0;
const signature_wall_1 = require("./signature-wall");
const surfaces_1 = require("./surfaces");
exports.xssWall = (0, signature_wall_1.createSignatureWall)("xss", "high", surfaces_1.ALL_SURFACES);
//# sourceMappingURL=xss.js.map