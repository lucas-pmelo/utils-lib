export declare const SIGNATURE_TABLE_VERSION = 1;
export interface Signature {
    wallId: string;
    pattern: RegExp;
}
export declare const signatures: Signature[];
export declare function signaturesFor(wallId: string): RegExp[];
