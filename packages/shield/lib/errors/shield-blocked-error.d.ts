import ClbError from "./clb-error";
import type { ScanResult } from "../domain/models";
export default class ShieldBlockedError extends ClbError {
    readonly result: ScanResult;
    constructor(result: ScanResult);
}
