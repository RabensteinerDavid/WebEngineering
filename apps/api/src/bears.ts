import { db } from './db.js';
import { bears } from './schema.js';
import { z } from './zod.js';

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

export async function loadBears(): Promise<Bear[]> {
  return await db
    .select({
      id: bears.id,
      name: bears.name,
      binomial: bears.binomial,
      image: bears.image,
      range: bears.range,
    })
    .from(bears)
    .orderBy(bears.position, bears.id)
    .execute();
}
