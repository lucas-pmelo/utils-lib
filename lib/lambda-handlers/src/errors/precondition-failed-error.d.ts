import ClbError from './clb-error';
export default class PreconditionFailedError extends ClbError {
    constructor(message?: string);
}
