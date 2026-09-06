import { guard } from "./guard.js";
import { toScannedFiles } from "./multer-files.js";
export function withShieldExpress(preset, override) {
    return (req, _res, next) => {
        guard({
            headers: req.headers,
            query: req.query,
            pathParameters: req.params,
            body: req.body,
            files: toScannedFiles(req.file, req.files),
        }, preset, override);
        next();
    };
}
//# sourceMappingURL=express.js.map