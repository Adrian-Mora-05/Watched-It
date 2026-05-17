import { Controller, Get,Body,Query, Param, BadRequestException, Headers } from '@nestjs/common';
import { ShowService } from './show.service';
import { createZodDto } from 'nestjs-zod'
import { readShowParam, getshowReviewsSchema, GetShowReviews  } from '../../../shared/show.schema';

class ReadShowParamDto extends createZodDto(readShowParam) {} //transforms the schema into a dto
class GetShowReviewsDto extends createZodDto(getshowReviewsSchema) {}

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
  if (!token) throw new BadRequestException('No token');

  return this.showService.getFavoriteShowsByUser(token);
}

@Get(':id')
async getShowById(
  @Param('id') id: number,
  @Query('id_user') id_user: string,
  @Query('name') name: string
) {
  return this.showService.getShowById(id, id_user, name);
}

@Get(':id/reviews')
async getShowReviews( @Param('id') id: string,  @Query() query: GetShowReviewsDto
) {
  const parsed = getshowReviewsSchema.parse(query)
  return this.showService.getshowReviews(Number(id), parsed)
}
}
