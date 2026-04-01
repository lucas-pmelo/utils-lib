import { describe, expect, test } from "bun:test";
import * as Joi from "joi";
import { z } from "zod";
import validateSchema, { validateSchemaZod } from "./schema-validator";

describe("Schema validator", () => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string(),
  });

  test("should validate schema successfully", () => {
    const { data, errors } = validateSchema(schema, {
      name: "Daniel",
      email: "daniel@test.com",
    });

    expect(errors).toBeUndefined();
    expect(data).toEqual({
      name: "Daniel",
      email: "daniel@test.com",
    });
  });

  test("should return error", () => {
    const { data, errors } = validateSchema(schema, {
      email: true,
    });

    expect(errors).toEqual([
      { name: "name", reason: "name is required", value: undefined },
      { name: "email", reason: "email must be a string", value: true },
    ]);
    expect(data).toBeUndefined();
  });
});

describe("Schema validator (Zod)", () => {
  const zSchema = z.object({
    name: z.string(),
    email: z.string().optional(),
  });

  test("should validate schema successfully (zod)", () => {
    const { data, errors } = validateSchemaZod(zSchema, {
      name: "Daniel",
      email: "daniel@test.com",
    } as any);

    expect(errors).toBeUndefined();
    expect(data).toEqual({
      name: "Daniel",
      email: "daniel@test.com",
    });
  });

  test("should return errors (zod)", () => {
    const { data, errors } = validateSchemaZod(zSchema, {
      email: true,
    } as any);

    expect(data).toBeUndefined();
    expect(errors).toBeDefined();
    expect(errors!.length).toBeGreaterThanOrEqual(1);

    const nameError = errors!.find((e) => e.name === "name");
    expect(nameError).toBeDefined();
    expect(nameError).toMatchObject({
      name: "name",
      value: undefined,
    });
    expect(nameError!.reason.toLowerCase()).toMatch(
      /required|expected|invalid/,
    );

    const emailError = errors!.find((e) => e.name === "email");
    expect(emailError).toBeDefined();
    expect(emailError).toMatchObject({
      name: "email",
      value: true,
    });
    expect(emailError!.reason.toLowerCase()).toMatch(/expected|invalid/);
  });
});
