import { z } from 'zod'

export const readMovie = z.object({
    titulo: z.string()
            .default(''), //gets all movies by default
    skip: z.number()
            .default(0), //gets the first movies by default
    limit: z.number()
            .default(9), //gets 10 movies by default
    anio: z.number()
            .optional(),
    genero: z.string()
            .optional(),
    restriccionEdad: z.boolean()
                    .optional(),
})

export type ReadMovie = z.infer<typeof readMovie> //generates a type from the schema
