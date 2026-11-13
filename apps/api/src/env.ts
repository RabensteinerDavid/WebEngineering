import { z } from './zod.js';

const httpUrl = z.url({ protocol: /^https?$/v });

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(?:ql)?$/v }),
  WIKIPEDIA_API_URL: httpUrl.default('https://en.wikipedia.org/w/api.php'),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:4173')
    .transform((value) => value.split(',').map((origin) => origin.trim()))
    .pipe(z.array(httpUrl)),
});

export const env = envSchema.parse(process.env);
