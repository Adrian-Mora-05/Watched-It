import { z } from 'zod';

export const getDiaryEntriesSchema = z.object({
    skip: z.coerce.number()
        .default(0),

    limit: z.coerce.number()
        .default(15),

    rating: z.coerce.number()
        .min(1)
        .max(5)
        .optional(),

    sort_order: z.enum(['asc', 'desc'])
        .default('desc')
});

export type GetDiaryEntriesSchema =
    z.infer<typeof getDiaryEntriesSchema>;