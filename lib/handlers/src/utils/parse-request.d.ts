import { Request as ExpressRequest } from "express";
import { Request } from "./models";
export declare const parseRequest: (request: ExpressRequest) => Request;
