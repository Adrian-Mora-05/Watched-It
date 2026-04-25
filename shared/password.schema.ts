import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  username: z.string().min(1),
});

export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8),
  refreshToken: z.string(),
});

export type ForgotPassword = z.infer<typeof ForgotPasswordSchema>;
export type ResetPassword = z.infer<typeof ResetPasswordSchema>