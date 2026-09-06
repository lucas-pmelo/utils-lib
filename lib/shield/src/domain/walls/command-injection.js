"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandInjectionWall = void 0;
const signature_wall_1 = require("./signature-wall");
const surfaces_1 = require("./surfaces");
exports.commandInjectionWall = (0, signature_wall_1.createSignatureWall)("command-injection", "high", surfaces_1.ALL_SURFACES);
//# sourceMappingURL=command-injection.js.map