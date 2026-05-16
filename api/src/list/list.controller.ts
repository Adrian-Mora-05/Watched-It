import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { ListService } from './list.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import { readListParam } from '../../../shared/list.schema';

class ReadListParamDto extends createZodDto(readListParam) {}

@UseGuards(JwtAuthGuard)
@Controller('list')
export class ListController {

  constructor(private readonly listService: ListService) {}

  @Get('/')
  async getListsOrSearch(
    @Req() req,
    @Query() param: ReadListParamDto
  ) {

    // si viene name => búsqueda
    if (param.name) {
      return this.listService.searchLists(param);
    }

    // si no => listas normales
    return this.listService.getLists(req.user.id, {
      skip: param.skip ?? 0,
      limit: param.limit ?? 15
    });
  }

  @Get('/:id')
  async getListById(@Param('id') id: number) {
    return this.listService.getListById(id);
  }

}