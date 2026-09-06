"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSchemaZod = exports.validateSchema = void 0;
const validateSchema = (schema, data) => {
    var _a;
    const { error, value } = schema.validate(data, {
        abortEarly: false,
        allowUnknown: false,
    });
    const hasError = !!((_a = error === null || error === void 0 ? void 0 : error.details) === null || _a === void 0 ? void 0 : _a.length);
    if (hasError) {
        const errors = error.details.map((err) => {
            var _a, _b, _c;
            return ({
                name: String((_b = (_a = err.context) === null || _a === void 0 ? void 0 : _a.key) !== null && _b !== void 0 ? _b : ""),
                value: (_c = err.context) === null || _c === void 0 ? void 0 : _c.value,
                reason: err.message.replace(/"/g, ""),
            });
        });
        return {
            errors,
        };
    }
    return { data: value };
};
exports.validateSchema = validateSchema;
const validateSchemaZod = (schema, data) => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        const zodError = parsed.error;
        const errors = zodError.issues.map((err) => {
            const key = err.path && err.path.length > 0 ? err.path[0] : "";
            const name = String(key !== null && key !== void 0 ? key : "");
            let valueAtKey = undefined;
            try {
                if (name && Object.prototype.hasOwnProperty.call(data, name)) {
                    valueAtKey = data[name];
                }
            }
            catch (_e) {
                valueAtKey = undefined;
            }
            return {
                name,
                value: valueAtKey,
                reason: err.message.replace(/"/g, ""),
            };
        });
        return { errors };
    }
    return { data: parsed.data };
};
exports.validateSchemaZod = validateSchemaZod;
exports.default = validateSchema;
//# sourceMappingURL=schema-validator.js.map