"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class ForbiddenError extends clb_error_1.default {
    constructor(message = 'ForbiddenError') {
        super({
            reason: message,
        }, 403);
    }
}
exports.default = ForbiddenError;
//# sourceMappingURL=forbidden-error.js.map