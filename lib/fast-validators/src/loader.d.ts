interface Exports {
    memory: WebAssembly.Memory;
    bufferPtr: () => number;
    bufferLen: () => number;
    isValidCPF: (len: number) => number;
    isValidCNPJ: (len: number) => number;
    isValidEmail: (len: number) => number;
    isValidPlate: (len: number) => number;
    isValidPhone: (len: number) => number;
}
export declare const wasm: Exports;
export declare function writeDigits(input: string): number;
export declare function writeAscii(input: string): number;
export declare function writePlate(input: string): number;
export {};
