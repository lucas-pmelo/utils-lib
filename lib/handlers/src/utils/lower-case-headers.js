"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lowerCaseHeaders = void 0;
const lowerCaseHeaders = (headers) => {
    return Object.entries(headers).reduce((headers, [key, value]) => {
        const lowerCasedKey = key.toLowerCase();
        headers[lowerCasedKey] = Array.isArray(value)
            ? value.join(",")
            : String(value);
        return headers;
    }, {});
};
exports.lowerCaseHeaders = lowerCaseHeaders;
//# sourceMappingURL=lower-case-headers.js.map