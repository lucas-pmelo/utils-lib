import type { ScannedFile } from "../domain/models";
export interface MulterLikeFile {
    originalname: string;
    mimetype?: string;
    size: number;
    buffer?: Uint8Array;
}
export declare function toScannedFiles(single: MulterLikeFile | undefined, many: MulterLikeFile[] | Record<string, MulterLikeFile[]> | undefined): ScannedFile[] | undefined;
