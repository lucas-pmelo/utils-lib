import ClbError from './clb-error';
export default class TooManyRequestsError extends ClbError {
    constructor(message?: string);
}
