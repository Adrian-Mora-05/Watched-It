import { z } from 'zod'

// buscar listas
export const readListParam = z.object({
    skip: z.coerce.number().default(0).optional(),
    limit: z.coerce.number().default(10).optional(),
    name: z.string().default('').optional(),
    type: z.enum(['pelicula', 'serie']).optional(),
})

// crear lista
export const createListSchema = z.object({
    name: z.string(),
    type: z.enum(['pelicula', 'serie']),
})

export type ReadListParam = z.infer<typeof readListParam>
export type CreateList = z.infer<typeof createListSchema>