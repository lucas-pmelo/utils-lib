"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class GoneError extends clb_error_1.default {
    constructor(message = 'GoneError') {
        super({
            reason: message,
        }, 410);
    }
}
exports.default = GoneError;
//# sourceMappingURL=gone-error.js.map