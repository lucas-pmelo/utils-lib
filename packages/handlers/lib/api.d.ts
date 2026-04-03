import { Request, Response } from "express";
import { Controller } from "./utils/models";
export declare class ApiHandler {
    private readonly controller;
    constructor(controller: Controller);
    handler(request: Request, response: Response): Promise<Response>;
}
