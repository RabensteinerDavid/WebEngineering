import { z } from './zod.js';

const httpUrl = z.url({ protocol: /^https?$/v });

const minimumSecretLength = 32;
const developmentSecret = 'local-development-session-secret-only';
const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    SESSION_SECRET: z
      .string()
      .min(minimumSecretLength)
      .default(developmentSecret),
    DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/v }),
    CORS_ORIGINS: z
      .string()
      .default('http://localhost:4173')
      .transform((value) => value.split(',').map((origin) => origin.trim()))
      .pipe(z.array(httpUrl)),
  })
  .refine(
    (value) =>
      value.NODE_ENV !== 'production' ||
      value.SESSION_SECRET !== developmentSecret,
    {
      message: 'Set a private SESSION_SECRET in production.',
      path: ['SESSION_SECRET'],
    }
  );

export const env = envSchema.parse(process.env);
