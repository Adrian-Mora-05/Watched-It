import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  username: z.string().min(1, 'Nombre no puede ser vacío'),
});

export const ResetPasswordSchema = z.object({
    newPassword: z.string()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'Contraseña debe tener al menos 6 caracteres'),
  refreshToken: z.string(),
});

export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>