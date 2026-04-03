import Joi from "joi";
import { ZodError, ZodType } from "zod";

interface Result<T> {
  errors?: ValidationError[];
  data?: T;
}

interface ValidationError {
  name: string;
  value: any;
  reason: string;
}

const validateSchema = <T>(schema: Joi.ObjectSchema<T>, data: T): Result<T> => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
  });

  const hasError = !!error?.details?.length;

  if (hasError) {
    const errors: ValidationError[] = error!.details.map((err) => ({
      name: String(err.context?.key ?? ""),
      value: (err.context as any)?.value,
      reason: err.message.replace(/"/g, ""),
    }));

    return {
      errors,
    };
  }

  return { data: value };
};

const validateSchemaZod = <T>(schema: ZodType<T>, data: T): Result<T> => {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const zodError = parsed.error as ZodError<T>;

    const errors: ValidationError[] = zodError.issues.map((err) => {
      const key = err.path && err.path.length > 0 ? err.path[0] : "";
      const name = String(key ?? "");

      let valueAtKey: any = undefined;
      try {
        if (name && Object.prototype.hasOwnProperty.call(data as any, name)) {
          valueAtKey = (data as any)[name];
        }
      } catch (_e) {
        valueAtKey = undefined;
      }

      return {
        name,
        value: valueAtKey,
        reason: err.message.replace(/"/g, ""),
      };
    });

    return { errors };
  }

  return { data: parsed.data };
};

export { validateSchema, validateSchemaZod };
export default validateSchema;
