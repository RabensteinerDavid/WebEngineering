import { z } from '../config/zod.js';

const minPasswordLength = 12;
const maxPasswordLength = 128;
export const registrationSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(minPasswordLength).max(maxPasswordLength),
});
export const userSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: z.enum(['user', 'moderator']),
  createdAt: z.iso.datetime(),
});
export type User = z.infer<typeof userSchema>;
export type Registration = z.infer<typeof registrationSchema>;

export const loginSchema = registrationSchema;
export type UserCredentials = User & { passwordHash: string };
