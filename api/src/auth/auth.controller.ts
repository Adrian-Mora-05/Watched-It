import { Controller, Post, Body, Get, Req, UseGuards, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createZodDto } from 'nestjs-zod';
import { createUser, loginUser } from '../../../shared/user.schema';
import { ForgotPasswordSchema, ResetPasswordSchema } from '../../../shared/password.schema';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

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
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

}