"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class ServiceUnavailableError extends clb_error_1.default {
    constructor(message = 'ServiceUnavailableError') {
        super({
            reason: message,
        }, 503);
    }
}
exports.default = ServiceUnavailableError;
//# sourceMappingURL=service-unavailable-error.js.map