export interface InvalidParam {
    value: string;
    reason: string;
}
export interface TreatedError {
    reason: string;
    invalidParams?: InvalidParam[];
}
export default class ClbError extends Error {
    isTreated: boolean;
    statusCode: number;
    error: TreatedError;
    constructor(error: TreatedError, statusCode: number);
    toObject(): {
        invalidParams: InvalidParam[];
        reason: string;
    };
}
