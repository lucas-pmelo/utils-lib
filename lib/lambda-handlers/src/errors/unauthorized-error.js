"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class UnauthorizedError extends clb_error_1.default {
    constructor(message = 'UnauthorizedError') {
        super({
            reason: message,
        }, 401);
    }
}
exports.default = UnauthorizedError;
//# sourceMappingURL=unauthorized-error.js.map