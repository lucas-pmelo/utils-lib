"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class TooManyRequestsError extends clb_error_1.default {
    constructor(message = 'TooManyRequestsError') {
        super({
            reason: message,
        }, 429);
    }
}
exports.default = TooManyRequestsError;
//# sourceMappingURL=too-many-requests-error.js.map