"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class InternalServerError extends clb_error_1.default {
    constructor(message = 'InternalServerError') {
        super({
            reason: message,
        }, 500);
    }
}
exports.default = InternalServerError;
//# sourceMappingURL=internal-server-error.js.map