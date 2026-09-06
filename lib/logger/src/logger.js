"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const crypto_1 = require("crypto");
const pino_1 = __importDefault(require("pino"));
const LEVELS = ["trace", "debug", "info", "warn", "error", "fatal"];
class Logger {
    constructor() {
        this.config = {};
        this.pino = (0, pino_1.default)({
            base: null,
            timestamp: false,
            messageKey: "message",
            formatters: {
                level: (label) => ({ level: label.toUpperCase() }),
            },
        });
        this.setLevel(process.env.LOGGER_LEVEL || LEVELS[0]);
    }
    setLevel(level) {
        if (level && LEVELS.includes(level)) {
            this.pino.level = level;
        }
    }
    setService(service) {
        this.config.service = service;
    }
    setRequestId(requestId) {
        this.config.requestId = requestId;
    }
    setHttp(method, url, host) {
        const http = {
            method,
            url,
        };
        this.config.http = http;
        this.config.host = host;
    }
    setUser(id, email) {
        const user = {
            id,
            email,
        };
        this.config.user = user;
    }
    reset() {
        this.config = {};
    }
    getConfig() {
        return Object.assign({ created_at: new Date().toISOString(), type: "log" }, this.config);
    }
    setEvent(service, event) {
        this.reset();
        this.setService(service);
        this.setRequestId((0, crypto_1.randomUUID)());
        if (!event) {
            return;
        }
        const { headers } = event;
        this.setUser(headers["x-user-id"], headers["x-user-email"]);
        this.setHttp(event.method, event.url, event.hostname);
    }
    trace(log) {
        const config = this.getConfig();
        this.pino.child(config).trace(log);
    }
    debug(log) {
        const config = this.getConfig();
        this.pino.child(config).debug(log);
    }
    info(log) {
        const config = this.getConfig();
        this.pino.child(config).info(log);
    }
    warn(log) {
        const config = this.getConfig();
        this.pino.child(config).warn(log);
    }
    error(log) {
        const config = this.getConfig();
        this.pino.child(config).error(log);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map