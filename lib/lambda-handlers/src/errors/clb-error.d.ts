export interface InvalidParam {
    value: string;
    reason: string;
}
export interface Error {
    reason: string;
    invalidParams?: InvalidParam[];
}
export default class ClbError extends Error {
    isTreated: boolean;
    statusCode: number;
    error: Error;
    constructor(error: Error, statusCode: number);
    toObject(): {
        invalidParams: InvalidParam[];
        reason: string;
    };
}
