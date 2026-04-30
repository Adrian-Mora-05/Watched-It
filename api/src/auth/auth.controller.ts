import { Controller, Post, Body, Get, Req, UseGuards, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createZodDto } from 'nestjs-zod';
import { createUser, loginUser } from '../../../shared/user.schema';
import { ForgotPasswordSchema, ResetPasswordSchema } from '../../../shared/password.schema';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import type { Response } from 'express';

class CreateUserDto extends createZodDto(createUser) {}
class LoginUserDto extends createZodDto(loginUser) {}
class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}
class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  @Post('signin')
  signIn(@Body() body: LoginUserDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body);
  }

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(@Req() req, @Body() dto: ResetPasswordDto) {
    const userToken = req.headers.authorization.replace('Bearer ', '');
    return this.authService.resetPassword(userToken, dto.refreshToken, dto.newPassword);
  }

  @Get('reset-password')
  async resetPasswordRedirect(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const appScheme = process.env.APP_SCHEME ?? 'watchedit';

    try {
      const { accessToken, refreshToken } = await this.authService.handleResetRedirect(token);

      return res.redirect(
        `${appScheme}://reset-password?access_token=${accessToken}&refresh_token=${refreshToken}`,
      );
    } catch {
      return res.redirect(`${appScheme}://reset-password?error=invalid_token`);
    }
  }
}