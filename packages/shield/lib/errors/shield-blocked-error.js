import ClbError from "./clb-error";
export default class ShieldBlockedError extends ClbError {
    result;
    constructor(result) {
        super({
            reason: "Request blocked by shield",
            invalidParams: result.findings.map((finding) => ({
                value: `${finding.surface}:${finding.path}`,
                reason: finding.wallId,
            })),
        }, 403);
        this.result = result;
    }
}
//# sourceMappingURL=shield-blocked-error.js.map