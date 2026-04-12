import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createZodDto } from 'nestjs-zod';
import { createUser, loginUser } from '../../../shared/user.schema';

class CreateUserDto extends createZodDto(createUser) {} //transforms the schema into a dto
class LoginUserDto extends createZodDto(loginUser) {} //transforms the schema into a dto
  
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
}