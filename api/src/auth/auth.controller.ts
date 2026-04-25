import { Controller, Post, Body, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createZodDto } from 'nestjs-zod';
import { createUser, loginUser } from '../../../shared/user.schema';
import { ForgotPasswordSchema,ResetPasswordSchema } from '../../../shared/password.schema';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

class CreateUserDto extends createZodDto(createUser) {} //transforms the schema into a dto
class LoginUserDto extends createZodDto(loginUser) {} //transforms the schema into a dto
class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {} 
class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {} 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body)
  }

  @Post('signin')
  signIn(@Body() body: LoginUserDto) {
    return this.authService.login(body)
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto){ //only the username is needed
    return this.authService.forgotPassword(body)
  }

  
  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(
    @Req() req,
    @Body() dto: ResetPasswordDto,
  ) {
    const userToken = req.headers.authorization.replace('Bearer ', '');
    return this.authService.resetPassword(userToken, dto.refreshToken, dto.newPassword);
  }
}