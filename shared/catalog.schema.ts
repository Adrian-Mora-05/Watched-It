import { z } from 'zod'

//general schema for pagination (by param)
export const readCatalogParam = z.object({ 
    skip: z.coerce.number().default(0).optional(),             
    limit: z.coerce.number().default(9).optional(),
    title: z.string().default('').optional(),
})

//schema for reading each movie with general info
export const readEachCatalogContent = z.object({
        id: z.number(),
        title: z.string(),
        image_link: z.string(),
        type_catalog: z.string(),

})

export const logCatalogContent = z.object({
    content: z.string().max(500, 'El contenido no puede exceder los 500 caracteres'),
    id_content: z.number(),
    rating: z.number(),
    type_content: z.string(),
})

export type ReadCatalogParam = z.infer<typeof readCatalogParam> //generates a type from the schema
export type ReadEachCatalogContent = z.infer<typeof readEachCatalogContent> //generates a type from the schema
export type LogCatalogContent = z.infer<typeof logCatalogContent> //generates a type from the schema