"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeEmpty = void 0;
const removeEmpty = (data) => {
    const obj = data;
    if (!data || typeof data !== "object") {
        return data;
    }
    Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === "object") {
            (0, exports.removeEmpty)(obj[key]);
        }
        else if (obj[key] === undefined || obj[key] === null || obj[key] === "") {
            delete obj[key];
        }
    });
    return obj;
};
exports.removeEmpty = removeEmpty;
//# sourceMappingURL=remove-empty.js.map