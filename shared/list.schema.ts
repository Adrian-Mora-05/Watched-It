import { z } from 'zod'

// buscar listas
export const readListParam = z.object({
    skip: z.coerce.number().default(0).optional(),
    limit: z.coerce.number().default(10).optional(),
    name: z.string().default('').optional(),
})

export const addToListSchema =z.object({

  tipo:         z.enum(['pelicula', 'serie']),
  nombre_lista: z.string(),
})

export const removeFromListSchema = z.object({

  tipo:         z.enum(['pelicula', 'serie']),
  nombre_lista: z.string(),
})

export type RemoveFromList = z.infer<typeof removeFromListSchema>
export type ReadListParam = z.infer<typeof readListParam>
export type AddToList = z.infer<typeof addToListSchema>