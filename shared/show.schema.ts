// shared/show.schema.ts

import { z } from 'zod'

// general schema for filtering shows (by param)
export const readShowParam = z.object({
    skip: z.coerce.number().default(0).optional(),
    limit: z.coerce.number().default(12).optional(),

    title: z.string().default('').optional(),

    year: z.coerce.number().optional(),

    genres: z.string().optional(),

    country: z.string().optional(),

    ageRestriction: z.preprocess(
    (value) => {

        if (value === 'true') {
        return true;
        }

        if (value === 'false') {
        return false;
        }

        return value;

    },
    z.boolean().optional()
    ),

    sortBy: z.enum([
        'popularity',
        'year',
        'title'
    ]).optional(),
    
    order: z.enum([
        'asc',
        'desc'
    ]).default('desc').optional(),

})

// schema for reading each show with general info
export const readEachShow = z.object({
    id: z.number(),
    title: z.string(),
    image_link: z.string()
})

export type ReadShowParam = z.infer<typeof readShowParam>

export type ReadEachShow = z.infer<typeof readEachShow>