import Joi from "joi";
import { ZodType } from "zod";
interface Result<T> {
    errors?: ValidationError<T>[];
    data?: T;
}
interface ValidationError<T> {
    name: string;
    value: T | undefined;
    reason: string;
}
declare const validateSchema: <T>(schema: Joi.ObjectSchema<T>, data: T) => Result<T>;
declare const validateSchemaZod: <T>(schema: ZodType<T>, data: T) => Result<T>;
export { validateSchema, validateSchemaZod };
export default validateSchema;
