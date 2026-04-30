import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUser, LoginUser } from '../../../shared/user.schema';
import { ForgotPassword, ResetPassword } from '../../../shared/password.schema';
import {supabase, supabaseAdmin} from '../config/db'
import { sgMail, resetUrlBase } from '../config/mail';

@Injectable()
export class AuthService {

  //*** Sign up a new user ***//
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

  //*** Log in a user ***//
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

  //*** Send reset password email ***//
  async forgotPassword(body: ForgotPassword) {
    
    const email = await this.getEmail(body.username)

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) throw new BadRequestException(error.message);

    const token = data.properties.hashed_token; 

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

  //*** Get user email by username ***//
  async getEmail(username: string) {
    let { data: usuario, error } = await supabase
      .from('usuario')
      .select('correo, nombre')
      .ilike('nombre', username);

      if (error) throw new BadRequestException(error.message);
      return usuario![0].correo as string
  }

  //*** Reset user password ***//
  async resetPassword(token: ResetPassword['token'], newPassword: ResetPassword['newPassword']) {

    const { data, error: verifyError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });
    if (verifyError) throw new BadRequestException(verifyError.message);
    if (!data || !data.user) throw new BadRequestException('Invalid token');

    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      data.user.id,
      { password: newPassword },
      
    );
    if (error) throw new BadRequestException(error.message);

    return { message: 'Contraseña actualizada' };
  }


}
