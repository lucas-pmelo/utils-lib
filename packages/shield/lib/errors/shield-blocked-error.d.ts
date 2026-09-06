import ClbError from "./clb-error.js";
import type { ScanResult } from "../domain/models.js";
export default class ShieldBlockedError extends ClbError {
    readonly result: ScanResult;
    constructor(result: ScanResult);
}
