"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidCPF = isValidCPF;
exports.isValidCNPJ = isValidCNPJ;
exports.isValidDocument = isValidDocument;
exports.isValidEmail = isValidEmail;
exports.isValidPlate = isValidPlate;
exports.isValidPhone = isValidPhone;
const loader_1 = require("./loader");
function isValidCPF(input) {
    const len = (0, loader_1.writeDigits)(input);
    return loader_1.wasm.isValidCPF(len) === 1;
}
function isValidCNPJ(input) {
    const len = (0, loader_1.writeDigits)(input);
    return loader_1.wasm.isValidCNPJ(len) === 1;
}
function isValidDocument(input) {
    const len = (0, loader_1.writeDigits)(input);
    if (len === 11)
        return loader_1.wasm.isValidCPF(len) === 1;
    if (len === 14)
        return loader_1.wasm.isValidCNPJ(len) === 1;
    return false;
}
function isValidEmail(input) {
    const trimmed = input.trim();
    const len = (0, loader_1.writeAscii)(trimmed);
    if (len < 0)
        return false;
    return loader_1.wasm.isValidEmail(len) === 1;
}
function isValidPlate(input) {
    const len = (0, loader_1.writePlate)(input);
    return loader_1.wasm.isValidPlate(len) === 1;
}
function isValidPhone(input) {
    const len = (0, loader_1.writeDigits)(input);
    return loader_1.wasm.isValidPhone(len) === 1;
}
//# sourceMappingURL=index.js.map