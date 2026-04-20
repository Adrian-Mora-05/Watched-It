import { z } from 'zod'

//general schema for pagination (by param)
export const readMovieParam = z.object({ 
    skip: z.coerce.number().default(0).optional(),             
    limit: z.coerce.number().default(9).optional(),
    title: z.string().default('').optional(),
    year: z.coerce.number().optional(),
    genre: z.string().optional(),
    ageRestriction: z.coerce.boolean().optional(),
})

//schema for reading each movie with general info
export const readEachMovie = z.object({
        id: z.number(),
        title: z.string(),
        image_link: z.string()
})

export type ReadMovieParam = z.infer<typeof readMovieParam> //generates a type from the schema
export type ReadEachMovie = z.infer<typeof readEachMovie> //generates a type from the schema
