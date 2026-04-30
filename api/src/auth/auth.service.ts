import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUser, LoginUser } from '../../../shared/user.schema';
import { ForgotPassword, ResetPassword } from '../../../shared/password.schema';
import {createUserClient, supabase, supabaseAdmin} from '../config/db'
import { sgMail, resetUrlBase } from '../config/mail';

@Injectable()
export class AuthService {

  async signUp(user: CreateUser) {
    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { nombre: user.name }
      }
    })

    if (error) throw new BadRequestException(error.message)

    return {
      message: 'User created successfully',
      user: data.user,
      session: data.session
    }
  }

  async login(user: LoginUser) { 

    const { data, error } = await supabase.auth.signInWithPassword({
      email:user.email,
      password: user.password
    })

    if (error) throw new BadRequestException(error.message)

    return {
      message: 'User logged in successfully',
      user: data.user,
      session: data.session
    }
  }

  async forgotPassword(body: ForgotPassword) {
    
    const email = await this.getEmail(body.username)

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) throw new BadRequestException(error.message);

    const token = data.properties.hashed_token; //build my own token with the hashed token and the user's email

    await sgMail.send({
        to: email,
        from: 'watcheditapi@gmail.com',
        templateId: 'd-23766714ab864a0f8e9aa6ce43a4babc',
        dynamicTemplateData: {
          reset_url: `${resetUrlBase}/reset-password?token=${token}`,
        },
      });

    return { message: 'Email sent' };
  }

  async getEmail(username: string) {

  let { data: usuario, error } = await supabase
    .from('usuario')
    .select('correo, nombre')
    .ilike('nombre', username);

    if (error) throw new BadRequestException(error.message);

    return usuario![0].correo as string
  }

  async resetPassword(userToken: string, refreshToken: string, newPassword: string) {
    const supabaseUser = createUserClient(userToken);

    const { error: sessionError } = await supabaseUser.auth.setSession({
      access_token: userToken,
      refresh_token: refreshToken,
    });
    if (sessionError) throw new BadRequestException(sessionError.message);

    const { error } = await supabaseUser.auth.updateUser({
      password: newPassword,
    });

    if (error) throw new BadRequestException(error.message);
    return { message: 'Contraseña actualizada' };
  }

  // Add to your auth.service.ts

  async handleResetRedirect(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const { hashedToken, email } = this.decodeResetToken(token);

    const { data: session, error } = await supabaseAdmin.auth.verifyOtp({
      email,
      token: hashedToken,
      type: 'recovery',
    });

    if (error || !session.session) {
      throw new BadRequestException('El enlace de restablecimiento es inválido o ha expirado');
    }

    return {
      accessToken: session.session.access_token,
      refreshToken: session.session.refresh_token,
    };
  }

  // Wherever you currently build the token in forgotPassword, extract this:
  buildResetToken(hashedToken: string, email: string): string {
    // adjust to however you're currently combining these two values
    return Buffer.from(JSON.stringify({ hashedToken, email })).toString('base64url');
  }

  decodeResetToken(token: string): { hashedToken: string; email: string } {
    try {
      return JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    } catch {
      throw new BadRequestException('Token inválido');
    }
  }
}
