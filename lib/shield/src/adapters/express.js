"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withShieldExpress = withShieldExpress;
const guard_1 = require("./guard");
const multer_files_1 = require("./multer-files");
function withShieldExpress(preset, override) {
    return (req, next) => {
        (0, guard_1.guard)({
            headers: req.headers,
            query: req.query,
            pathParameters: req.params,
            body: req.body,
            files: (0, multer_files_1.toScannedFiles)(req.file, req.files),
        }, preset, override);
        next();
    };
}
//# sourceMappingURL=express.js.map