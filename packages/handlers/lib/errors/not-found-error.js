"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class NotFoundError extends clb_error_1.default {
    constructor(message = 'NotFoundError') {
        super({
            reason: message,
        }, 404);
    }
}
exports.default = NotFoundError;
//# sourceMappingURL=not-found-error.js.map