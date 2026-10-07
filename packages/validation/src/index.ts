import { z } from 'zod';

export const loginBodySchema = z.object({
  role: z.string().min(1).default('admin'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;
