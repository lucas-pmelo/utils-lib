import { describe, expect, it } from "bun:test";
import {
  isValidCNPJ,
  isValidCPF,
  isValidDocument,
  isValidEmail,
  isValidPhone,
  isValidPlate,
} from "./index";

describe("isValidCPF", () => {
  it("accepts a valid CPF", () => {
    expect(isValidCPF("11144477735")).toBe(true);
  });

  it("accepts a valid CPF with formatting", () => {
    expect(isValidCPF("111.444.777-35")).toBe(true);
  });

  it("rejects a CPF with bad checksum", () => {
    expect(isValidCPF("11144477736")).toBe(false);
  });

  it("rejects a CPF with all same digits", () => {
    expect(isValidCPF("11111111111")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidCPF("1234567890")).toBe(false);
  });
});

describe("isValidCNPJ", () => {
  it("accepts a valid CNPJ", () => {
    expect(isValidCNPJ("11222333000181")).toBe(true);
  });

  it("accepts a valid CNPJ with formatting", () => {
    expect(isValidCNPJ("11.222.333/0001-81")).toBe(true);
  });

  it("rejects a CNPJ with bad checksum", () => {
    expect(isValidCNPJ("11222333000180")).toBe(false);
  });

  it("rejects a CNPJ with all same digits", () => {
    expect(isValidCNPJ("11111111111111")).toBe(false);
  });
});

describe("isValidDocument", () => {
  it("accepts a valid CPF", () => {
    expect(isValidDocument("111.444.777-35")).toBe(true);
  });

  it("accepts a valid CNPJ", () => {
    expect(isValidDocument("11.222.333/0001-81")).toBe(true);
  });

  it("rejects something neither CPF nor CNPJ shaped", () => {
    expect(isValidDocument("123")).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts a typical email", () => {
    expect(isValidEmail("lucas.pmelo@gmail.com")).toBe(true);
  });

  it("accepts email with plus and underscore in local", () => {
    expect(isValidEmail("foo_bar+baz@example.co.uk")).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    expect(isValidEmail("  lucas@gmail.com  ")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("lucasgmail.com")).toBe(false);
  });

  it("rejects email with two @", () => {
    expect(isValidEmail("a@b@c.com")).toBe(false);
  });

  it("rejects empty local part", () => {
    expect(isValidEmail("@gmail.com")).toBe(false);
  });

  it("rejects single-letter TLD", () => {
    expect(isValidEmail("a@b.c")).toBe(false);
  });

  it("rejects consecutive dots", () => {
    expect(isValidEmail("a..b@x.com")).toBe(false);
  });

  it("rejects domain ending with dash", () => {
    expect(isValidEmail("a@x-.com")).toBe(false);
  });

  it("rejects non-ASCII chars", () => {
    expect(isValidEmail("luís@gmail.com")).toBe(false);
  });
});

describe("isValidPlate", () => {
  it("accepts classic plate", () => {
    expect(isValidPlate("ABC1234")).toBe(true);
  });

  it("accepts Mercosul plate", () => {
    expect(isValidPlate("ABC1B23")).toBe(true);
  });

  it("accepts plate with dash", () => {
    expect(isValidPlate("ABC-1234")).toBe(true);
  });

  it("uppercases lowercase input", () => {
    expect(isValidPlate("abc1b23")).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isValidPlate("ABC123")).toBe(false);
  });

  it("rejects shape not matching either format", () => {
    expect(isValidPlate("1234ABC")).toBe(false);
  });

  it("rejects mercosul-like with letter where digit must be", () => {
    expect(isValidPlate("ABCDB23")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("accepts a landline (10 digits)", () => {
    expect(isValidPhone("1133334444")).toBe(true);
  });

  it("accepts a mobile (11 digits)", () => {
    expect(isValidPhone("11933334444")).toBe(true);
  });

  it("accepts formatted mobile", () => {
    expect(isValidPhone("(11) 93333-4444")).toBe(true);
  });

  it("accepts mobile with country code", () => {
    expect(isValidPhone("+55 (11) 93333-4444")).toBe(true);
  });

  it("rejects mobile without leading 9", () => {
    expect(isValidPhone("11833334444")).toBe(false);
  });

  it("rejects DDD starting with 0", () => {
    expect(isValidPhone("01933334444")).toBe(false);
  });

  it("rejects wrong length", () => {
    expect(isValidPhone("123")).toBe(false);
  });
});
