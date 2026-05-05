import { z } from "zod";
import {
  isValidCNPJ,
  isValidCPF,
  isValidDocument,
  isValidEmail,
  isValidPhone,
  isValidPlate,
} from "./index";

export const cpf = () => z.string().refine(isValidCPF, "Invalid CPF");

export const cnpj = () => z.string().refine(isValidCNPJ, "Invalid CNPJ");

export const document = () =>
  z.string().refine(isValidDocument, "Invalid document (CPF or CNPJ)");

export const email = () => z.string().refine(isValidEmail, "Invalid email");

export const plate = () =>
  z.string().refine(isValidPlate, "Invalid plate (classic or Mercosul)");

export const phone = () =>
  z.string().refine(isValidPhone, "Invalid phone (BR)");
