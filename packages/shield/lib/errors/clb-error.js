export default class ClbError extends Error {
    isTreated;
    statusCode;
    error;
    constructor(error, statusCode) {
        super(error.reason);
        this.message = error.reason;
        this.isTreated = true;
        this.statusCode = statusCode;
        this.error = error;
    }
    toObject() {
        return {
            reason: this.error.reason,
            ...(this.error.invalidParams?.length && {
                invalidParams: this.error.invalidParams,
            }),
        };
    }
}
//# sourceMappingURL=clb-error.js.map