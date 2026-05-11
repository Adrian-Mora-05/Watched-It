import { Controller, Get,Body,Query, Param, BadRequestException, Headers } from '@nestjs/common';
import { ShowService } from './show.service';
import { createZodDto } from 'node_modules/nestjs-zod/dist/index.mjs';
import { readShowParam } from '../../../shared/show.schema';

class ReadShowParamDto extends createZodDto(readShowParam) {} //transforms the schema into a dto

@Controller('show')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  @Get()
  async getAllShows(@Query() param: ReadShowParamDto) {
      return this.showService.getAllShows(param);
  }

 @Get('favorites')
  async getFavorites(@Headers('authorization') auth: string) {
  const token = auth?.replace('Bearer ', '');
  console.log("Received token:", token);
  if (!token) throw new BadRequestException('No token');

  return this.showService.getFavoriteShowsByUser(token);
}

}