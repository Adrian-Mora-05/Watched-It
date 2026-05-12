import { Controller, Get,Body,Query, Param, BadRequestException, Headers } from '@nestjs/common';
import { MovieService } from './movie.service';
import { readMovieParam } from '../../../shared/movie.schema';
import { createZodDto } from 'nestjs-zod'

class ReadMovieParamDto extends createZodDto(readMovieParam) {} //transforms the schema into a dto

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  async getAllMovies(@Query() param: ReadMovieParamDto) {
      return this.movieService.getAllMovies(param);
  }

 @Get('favorites')
  async getFavorites(@Headers('authorization') auth: string) {
  const token = auth?.replace('Bearer ', '');
  if (!token) throw new BadRequestException('No token');

  return this.movieService.getFavoriteMoviesByUser(token);
}

}
