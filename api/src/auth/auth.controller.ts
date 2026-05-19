import { Controller, Post, Body,Get,Query,Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createZodDto } from 'nestjs-zod';
import { createUser, loginUser } from '../../../shared/user.schema';
import { ForgotPasswordSchema, ResetPasswordSchema } from '../../../shared/password.schema';

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

  @Get('reset-password')
  redirect(@Query('token') token: string, @Res() res: any) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <body>
          <script>
            window.location = 'watchedit://reset-password?token=${token}';
            setTimeout(() => {
              document.body.innerHTML = '<p>Si la app no abrió, abrila manualmente.</p>';
            }, 2000);
          </script>
          <p>Redirigiendo a Watched-It...</p>
        </body>
      </html>
    `);
  }
  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }
}