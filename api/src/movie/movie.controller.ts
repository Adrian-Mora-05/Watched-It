import { Controller, Get,Body } from '@nestjs/common';
import { MovieService } from './movie.service';
import { readMovie } from '../../../shared/movie.schema';
import { createZodDto } from 'node_modules/nestjs-zod/dist/index.mjs';

class ReadMovieDto extends createZodDto(readMovie) {} //transforms the schema into a dto

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

    @Get('/')
    async getAllMovies(@Body() data: ReadMovieDto) {
        return this.movieService.getAllMovies(data);
    }

}