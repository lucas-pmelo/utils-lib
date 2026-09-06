import type { Limits } from "../models";
export interface WalkVisitor {
    onNode(key: string, value: unknown, path: string): void;
    onLeafString(value: string, path: string): void;
}
export interface WalkOutcome {
    truncated: boolean;
}
export declare function walk(body: unknown, limits: Limits, visitor: WalkVisitor, rootPath?: string): WalkOutcome;
