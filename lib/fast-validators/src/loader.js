"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wasm = void 0;
exports.writeDigits = writeDigits;
exports.writeAscii = writeAscii;
exports.writePlate = writePlate;
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = __importDefault(require("node:url"));
const here = node_path_1.default.dirname(node_url_1.default.fileURLToPath(import.meta.url));
const wasmPath = node_path_1.default.resolve(here, "..", "fast_validators.wasm");
const bytes = node_fs_1.default.readFileSync(wasmPath);
const { instance } = await WebAssembly.instantiate(bytes, {});
exports.wasm = instance.exports;
const bufPtr = exports.wasm.bufferPtr();
const bufCap = exports.wasm.bufferLen();
function view() {
    return new Uint8Array(exports.wasm.memory.buffer, bufPtr, bufCap);
}
function writeDigits(input) {
    const v = view();
    let n = 0;
    for (let i = 0; i < input.length && n < bufCap; i++) {
        const c = input.charCodeAt(i);
        if (c >= 48 && c <= 57)
            v[n++] = c;
    }
    return n;
}
function writeAscii(input) {
    const v = view();
    const len = Math.min(input.length, bufCap);
    for (let i = 0; i < len; i++) {
        const c = input.charCodeAt(i);
        if (c > 0x7f)
            return -1;
        v[i] = c;
    }
    return len;
}
function writePlate(input) {
    const v = view();
    let n = 0;
    for (let i = 0; i < input.length && n < bufCap; i++) {
        const c = input.charCodeAt(i);
        if (c >= 48 && c <= 57)
            v[n++] = c;
        else if (c >= 65 && c <= 90)
            v[n++] = c;
        else if (c >= 97 && c <= 122)
            v[n++] = c - 32;
    }
    return n;
}
//# sourceMappingURL=loader.js.map