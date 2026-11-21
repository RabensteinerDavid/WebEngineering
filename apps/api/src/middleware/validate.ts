import { z } from '../config/zod.js';
import { ValidationError } from '../errors.js';

export function validate<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new ValidationError(
      'Invalid request input.',
      result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
    );
  }
  return result.data;
}

export const emptyInput = z.strictObject({});
