import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards
} from '@nestjs/common';

import { ListService } from './list.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import {
  createListSchema,
  readListParam
} from '../../../shared/list.schema';

class ReadListParamDto extends createZodDto(readListParam) {}
class CreateListDto extends createZodDto(createListSchema) {}

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get()
  async getAllLists(@Query() param: ReadListParamDto) {
    return this.listService.getAllLists(param);
  }

  @Get(':id')
  async getListById(@Param('id') id: number) {
    return this.listService.getListById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createList(
    @Req() req,
    @Body() body: CreateListDto
  ) {
    return this.listService.createList(
      req.user.id,
      body
    );
  }
}