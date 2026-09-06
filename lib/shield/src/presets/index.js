"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqsPreset = exports.publicApiPreset = exports.internalApiPreset = exports.batchPreset = void 0;
var batch_1 = require("./batch");
Object.defineProperty(exports, "batchPreset", { enumerable: true, get: function () { return batch_1.batchPreset; } });
var internal_api_1 = require("./internal-api");
Object.defineProperty(exports, "internalApiPreset", { enumerable: true, get: function () { return internal_api_1.internalApiPreset; } });
var public_api_1 = require("./public-api");
Object.defineProperty(exports, "publicApiPreset", { enumerable: true, get: function () { return public_api_1.publicApiPreset; } });
var sqs_1 = require("./sqs");
Object.defineProperty(exports, "sqsPreset", { enumerable: true, get: function () { return sqs_1.sqsPreset; } });
//# sourceMappingURL=index.js.map