import { Controller, Patch, UploadedFile, UseInterceptors, Req, UseGuards, Post, Body, Get, BadRequestException, Headers, Put, Delete, Query, Param} from '@nestjs/common';
import { UserService } from './user.service';
import { Multer } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';
import { logCatalogContent, LogCatalogContent } from '../../../shared/catalog.schema';
import { createZodDto } from 'nestjs-zod'
import { supabase } from 'src/config/db';

class logCatalogContentDto extends createZodDto(logCatalogContent) {} 

@UseGuards(JwtAuthGuard)// Protect all routes in this controller with JWT authentication
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Req() req) {
    return this.userService.getUserProfile(req.user.id);
  }

  @Patch('profile-picture')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Multer.File, 
    @Req() req 
  ) {
 
    return this.userService.uploadUserPic(file, req.user.id);
  }

  @Delete('profile-picture')
  removeProfilePicture(@Req() req) {
    return this.userService.removeProfilePicture(req.user.id);
  }

  @Post('favorites')
  async addFavorites(
    @Req() req,
    @Body() body: { movies: number[], shows: number[] }
  ) {
    const { movies, shows } = body;
    return this.userService.addUserFavoriteContent(req.user.id, movies, shows);
  }
  
  @Put('favorites')
    async updateFavorites(
      @Req() req,
      @Body() body: { movies: number[], shows: number[] }
    ) {
      const { movies, shows } = body;

      return this.userService.updateUserFavorites(
        req.user.id,
        movies,
        shows
      );
    }

  @Post('rating')
  async logContent(
    @Req() req,
    @Body() body: logCatalogContentDto
  ) {
    return this.userService.logContent(req.user.id,body);
  }
  
  @Put('log/:logId')
  async updateLogContent(
    @Param('logId') logId: string,
    @Body()
    body: {
      content?: string;
      rating: number;
      type_content: string;
    },
    @Req() req: any
  ) {
    const userId = req.user.id;

    return this.userService.updateLogContent(
      userId,
      Number(logId),
      body
    );
  }

  @Delete('rating/:id')
  async deleteLogContent(
    @Req() req,
    @Param('id') id: string,
    @Query('type_content') typeContent: string
  ) {
    return this.userService.deleteLogContent(
      req.user.id,
      Number(id),
      typeContent
    );
  }

  @Get('log/:id')
  async getLogById(
    @Req() req,
    @Param('id') id: string,
    @Query('type') type: string
  ) {
    return this.userService.getUserLogById(
      req.user.id,
      Number(id),
      type
    );
  }

  @Get('search')
  async searchUsers(@Query('name') name: string) {
      return this.userService.searchUsers(name);
  }


}