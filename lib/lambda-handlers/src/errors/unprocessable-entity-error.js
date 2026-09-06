"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class UnprocessableEntityError extends clb_error_1.default {
    constructor(message = 'UnprocessableEntityError') {
        super({
            reason: message,
        }, 422);
    }
}
exports.default = UnprocessableEntityError;
//# sourceMappingURL=unprocessable-entity-error.js.map