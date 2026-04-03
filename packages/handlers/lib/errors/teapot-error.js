"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clb_error_1 = __importDefault(require("./clb-error"));
class TeapotError extends clb_error_1.default {
    constructor(message = 'TeapotError') {
        super({
            reason: message,
        }, 418);
    }
}
exports.default = TeapotError;
//# sourceMappingURL=teapot-error.js.map