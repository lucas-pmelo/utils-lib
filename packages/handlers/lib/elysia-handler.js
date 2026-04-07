"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResponse = createResponse;
exports.withErrorHandler = withErrorHandler;
function createResponse({ status, data }) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}
function withErrorHandler(fn, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield fn();
        }
        catch (error) {
            if (error && typeof error === "object" && error.isTreated) {
                const clbError = error;
                return createResponse({ status: clbError.statusCode, data: clbError.toObject() });
            }
            return createResponse({ status: 500, data: { error: message } });
        }
    });
}
//# sourceMappingURL=elysia-handler.js.map