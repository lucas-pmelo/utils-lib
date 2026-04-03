"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class ValidationError extends clb_error_1.default {
    constructor(message, invalidParams) {
        super({
            reason: message,
            invalidParams,
        }, 400);
    }
}
exports.default = ValidationError;
//# sourceMappingURL=validation-error.js.map