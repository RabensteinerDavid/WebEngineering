import { z } from './zod.js';

const httpUrl = z.url({ protocol: /^https?$/v });

const minimumSecretLength = 32;
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  SESSION_SECRET: z.string().min(minimumSecretLength),
  DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/v }),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:4173')
    .transform((value) => value.split(',').map((origin) => origin.trim()))
    .pipe(z.array(httpUrl)),
});

export const env = envSchema.parse(process.env);
