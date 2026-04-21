import { Controller, Patch, UploadedFile, UseInterceptors, Req, UseGuards, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';

@UseGuards(JwtAuthGuard)// Protect all routes in this controller with JWT authentication
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Multer.File, 
    @Req() req 
  ) {
 
    return this.userService.uploadUserPic(file, req.user.id);
  }

  @Post('favorites')
  async addFavorites(
    @Req() req,
    @Body() body: { movies: number[], shows: number[] }
  ) {
    const { movies, shows } = body;
    return this.userService.addUserFavoriteContent(req.user.id, movies, shows);
  } 
}