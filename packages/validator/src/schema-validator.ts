import Joi from "joi";
import { ZodError, ZodType } from "zod";

interface Result<T> {
  errors?: ValidationError<T>[];
  data?: T;
}

interface ValidationError<T> {
  name: string;
  value: T | undefined;
  reason: string;
}

const validateSchema = <T>(schema: Joi.ObjectSchema<T>, data: T): Result<T> => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    allowUnknown: false,
  });

  const hasError = !!error?.details?.length;

  if (hasError) {
    const errors: ValidationError<T>[] = error!.details.map((err) => ({
      name: String(err.context?.key ?? ""),
      value: (err.context as any)?.value as T,
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

    const errors: ValidationError<T>[] = zodError.issues.map((err) => {
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
        value: valueAtKey as T | undefined,
        reason: err.message.replace(/"/g, ""),
      };
    });

    return { errors };
  }

  return { data: parsed.data };
};

export { validateSchema, validateSchemaZod };
export default validateSchema;
