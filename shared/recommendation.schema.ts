import { z } from 'zod'

export const recommendationsParam = z.object({
    movieIds: z.array(z.number()).length(3, 'You must provide exactly 3 movie ids'),
    limit: z.coerce.number().default(10).optional(),
})

export const readEachRecommendation = z.object({
    id: z.number(),
    titulo: z.string(),
    sinopsis: z.string(),
    similarity: z.number(),
})

export type ReadRecommendationsParam = z.infer<typeof recommendationsParam>
export type ReadEachRecommendation = z.infer<typeof readEachRecommendation>