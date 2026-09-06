export declare const SIGNATURE_TABLE_VERSION = 2;
export interface Signature {
    wallId: string;
    pattern: RegExp;
}
export declare const signatures: readonly Signature[];
export declare function signaturesFor(wallId: string): readonly RegExp[];
