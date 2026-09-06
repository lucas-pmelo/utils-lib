"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phone = exports.plate = exports.email = exports.document = exports.cnpj = exports.cpf = void 0;
const zod_1 = require("zod");
const index_1 = require("./index");
const cpf = () => zod_1.z.string().refine(index_1.isValidCPF, "Invalid CPF");
exports.cpf = cpf;
const cnpj = () => zod_1.z.string().refine(index_1.isValidCNPJ, "Invalid CNPJ");
exports.cnpj = cnpj;
const document = () => zod_1.z.string().refine(index_1.isValidDocument, "Invalid document (CPF or CNPJ)");
exports.document = document;
const email = () => zod_1.z.string().refine(index_1.isValidEmail, "Invalid email");
exports.email = email;
const plate = () => zod_1.z.string().refine(index_1.isValidPlate, "Invalid plate (classic or Mercosul)");
exports.plate = plate;
const phone = () => zod_1.z.string().refine(index_1.isValidPhone, "Invalid phone (BR)");
exports.phone = phone;
//# sourceMappingURL=zod.js.map