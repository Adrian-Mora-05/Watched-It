import { z } from 'zod'

// buscar listas
export const readListParam = z.object({
    skip: z.coerce.number().default(0).optional(),
    limit: z.coerce.number().default(10).optional(),
    name: z.string().default('').optional(),
})

// crear lista
export const createListSchema = z.object({
    name: z.string(),
    movieIds: z.array(z.number()).default([]),
})

export type ReadListParam = z.infer<typeof readListParam>
export type CreateList = z.infer<typeof createListSchema>