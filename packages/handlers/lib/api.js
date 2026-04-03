"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandler = void 0;
const internal_server_error_1 = __importDefault(require("./errors/internal-server-error"));
const parse_request_1 = require("./utils/parse-request");
const logger_1 = __importDefault(require("@lucas-pmelo/logger"));
class ApiHandler {
    constructor(controller) {
        this.controller = controller;
    }
    handler(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const parsedRequest = (0, parse_request_1.parseRequest)(request);
                const res = yield this.controller(parsedRequest);
                if (!res || !res.body) {
                    return response.status(204).send();
                }
                return response.status(res.statusCode || 200).send(res.body);
            }
            catch (error) {
                if (error.isTreated) {
                    return response.status(error.statusCode).send(error.toObject());
                }
                logger_1.default.error(error);
                return response.status(500).send(new internal_server_error_1.default().toObject());
            }
        });
    }
}
exports.ApiHandler = ApiHandler;
//# sourceMappingURL=api.js.map