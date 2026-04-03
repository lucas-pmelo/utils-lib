"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class BadRequestError extends clb_error_1.default {
    constructor(message = 'BadRequestError') {
        super({
            reason: message,
        }, 400);
    }
}
exports.default = BadRequestError;
//# sourceMappingURL=bad-request-error.js.map