"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ClbError extends Error {
    constructor(error, statusCode) {
        super(error.reason);
        this.message = error.reason;
        this.isTreated = true;
        this.statusCode = statusCode;
        this.error = error;
    }
    toObject() {
        var _a;
        return Object.assign({ reason: this.error.reason }, (((_a = this.error.invalidParams) === null || _a === void 0 ? void 0 : _a.length) && {
            invalidParams: this.error.invalidParams,
        }));
    }
}
exports.default = ClbError;
//# sourceMappingURL=clb-error.js.map