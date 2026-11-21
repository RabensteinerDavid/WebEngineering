import { z } from '../config/zod.js';

const minimumLength = 1;
const placeholder = '/media/placeholder.png';

export const bearSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/v),
  name: z.string().trim().min(minimumLength),
  binomial: z.string().trim().min(minimumLength),
  range: z.string().trim().min(minimumLength),
  image: z.union([z.url(), z.literal(placeholder)]),
});
export type Bear = z.infer<typeof bearSchema>;

const maxQueryLength = 100;
export const bearSearchQuery = z.strictObject({
  q: z.string().trim().max(maxQueryLength).optional(),
});
