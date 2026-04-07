import { z } from 'zod'

export const createUser = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    name: z.string().min(1, 'Name cannot be empty').max(100, 'Name too long'),
})

export type CreateUser = z.infer<typeof createUser> //generates a type from the schema