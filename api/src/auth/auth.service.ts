import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateUser } from '../../../shared/user.schema';
import {supabase} from '../config/db'

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
      user: data.user
    }
  }
}
