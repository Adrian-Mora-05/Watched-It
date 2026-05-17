import { z } from 'zod'

export const createUser = z.object({
    email: z.string()
            .min(1, 'El correo electrónico es obligatorio')
            .email('Correo electrónico inválido'),
    password: z.string()
                .min(6, 'Contraseña debe tener al menos 6 caracteres'),
    name: z.string()
            .min(1, 'Nombre no puede ser vacío')
            .max(100, 'Nombre demasiado largo'),
})

export const loginUser = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Correo electrónico inválido'),
  password: z.string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'Contraseña debe tener al menos 6 caracteres'),
})

export const readUserParam = z.object({

    skip: z.coerce.number().default(0).optional(),

    limit: z.coerce.number().default(12).optional(),

    name: z.string().default('').optional(),
})

export type CreateUser = z.infer<typeof createUser> //generates a type from the schema
export type LoginUser = z.infer<typeof loginUser> //generates a type from the schema
export type ReadUserParam = z.infer<typeof readUserParam> //generates a type from the schema