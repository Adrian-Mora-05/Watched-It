import { Controller, Get,Body,Query } from '@nestjs/common';
import { MovieService } from './movie.service';
import { readMovieParam } from '../../../shared/movie.schema';
import { createZodDto } from 'node_modules/nestjs-zod/dist/index.mjs';

class ReadMovieParamDto extends createZodDto(readMovieParam) {} //transforms the schema into a dto

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('/')
  async getAllMovies(@Query() param: ReadMovieParamDto) {
      return this.movieService.getAllMovies(param);
  }

}