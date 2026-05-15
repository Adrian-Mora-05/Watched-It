import { Controller, Get,Body,Query, Param, BadRequestException, Headers, Req } from '@nestjs/common';
import { MovieService } from './movie.service';
import { getMovieReviewsSchema,  readMovieParam } from '../../../shared/movie.schema';
import { createZodDto } from 'nestjs-zod'

class ReadMovieParamDto extends createZodDto(readMovieParam) {} //transforms the schema into a dto
class GetMovieReviewsDto extends createZodDto(getMovieReviewsSchema) {} //transforms the schema into a dto

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

@Get(':id')
async getMovieById(
  @Param('id') id: number,
  @Query('id_user') id_user: string,
  @Query('name') name: string
) {
  return this.movieService.getMovieById(id, id_user, name);
}

@Get(':id/reviews')
async getMovieReviews( @Param('id') id: string,  @Query() query: GetMovieReviewsDto
) {
  const parsed = getMovieReviewsSchema.parse(query)
  return this.movieService.getMovieReviews(Number(id), parsed)
}


}
