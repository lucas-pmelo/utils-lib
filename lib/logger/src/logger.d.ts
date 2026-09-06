import { Request } from "express";
import pino from "pino";
interface Config {
    user?: {
        id: string;
        email: string;
    };
    host?: string;
    http?: {
        method: string;
        url: string;
    };
    requestId?: string;
    service?: string;
}
export declare class Logger {
    config: Config;
    pino: pino.Logger;
    constructor();
    setLevel(level: string): void;
    setService(service: string): void;
    setRequestId(requestId: string): void;
    setHttp(method: string, url: string, host: string): void;
    setUser(id: string, email: string): void;
    reset(): void;
    getConfig(): {
        user?: {
            id: string;
            email: string;
        };
        host?: string;
        http?: {
            method: string;
            url: string;
        };
        requestId?: string;
        service?: string;
        created_at: string;
        type: string;
    };
    setEvent(service: string, event: Request): void;
    trace(log: any): void;
    debug(log: any): void;
    info(log: any): void;
    warn(log: any): void;
    error(log: any): void;
}
export {};
