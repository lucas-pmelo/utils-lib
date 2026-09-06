"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequest = void 0;
const crypto_1 = require("crypto");
const lower_case_headers_1 = require("./lower-case-headers");
const remove_empty_1 = require("./remove-empty");
const parseRequest = (request) => {
    const headers = (0, lower_case_headers_1.lowerCaseHeaders)(request.headers);
    return {
        id: (0, crypto_1.randomUUID)(),
        headers,
        url: request.baseUrl,
        ip: request.ip,
        method: request.method,
        originalUrl: request.originalUrl,
        params: Object.assign(Object.assign({}, (0, remove_empty_1.removeEmpty)(request.params)), (0, remove_empty_1.removeEmpty)(request.query)),
        pathParameters: (0, remove_empty_1.removeEmpty)(request.params),
        path: request.path,
        query: (0, remove_empty_1.removeEmpty)(request.query),
        body: request.body,
        host: request.hostname,
    };
};
exports.parseRequest = parseRequest;
//# sourceMappingURL=parse-request.js.map