import { z } from 'zod'

// buscar listas
export const readListParam = z.object({
    skip: z.coerce.number().default(0).optional(),
    limit: z.coerce.number().default(10).optional(),
    name: z.string().default('').optional(),
    type: z.enum(['pelicula', 'serie']).optional(),
})

export const addToListSchema =z.object({

  tipo:         z.enum(['pelicula', 'serie']),
  nombre_lista: z.string(),
})

export const removeFromListSchema = z.object({

  tipo:         z.enum(['pelicula', 'serie']),
  nombre_lista: z.string(),
})

export const PorVerItemSchema = z.object({
  lista_id: z.number(),
  id_usuario: z.number(),
  nombre: z.string(),
  tipo: z.enum(["pelicula", "serie"]),
  contenido_id: z.number(),
  fecha_creacion: z.string(),
});

export const createListSchema = z.object({
  nombre_lista: z.string().min(1).refine(
    (val) => val.toLowerCase().trim() !== 'por_ver',
    { message: 'El nombre "por_ver" está reservado' }
  ),
  tipo: z.enum(['pelicula', 'serie']),
  id_contenido: z.number().optional(),
})

export const deleteListSchema = z.object({
  nombre_lista: z.string().min(1),
  tipo: z.enum(['pelicula', 'serie']),
})

export const renameListSchema = z.object({
  nombre_lista: z.string().min(1),
  nuevo_nombre: z.string().min(1).refine(
    (val) => val.toLowerCase().trim() !== 'por_ver',
    { message: 'El nombre "por_ver" está reservado' }
  ),
  tipo: z.enum(['pelicula', 'serie']),
})

export type RemoveFromList = z.infer<typeof removeFromListSchema>
export type ReadListParam = z.infer<typeof readListParam>
export type AddToList = z.infer<typeof addToListSchema>
export const PorVerListSchema = z.array(PorVerItemSchema);
export type CreateList = z.infer<typeof createListSchema>
export type DeleteList = z.infer<typeof deleteListSchema>
export type RenameList = z.infer<typeof renameListSchema>