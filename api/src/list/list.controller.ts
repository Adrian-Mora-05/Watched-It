import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ListService } from './list.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import { addToListSchema,  removeFromListSchema } from '../../../shared/list.schema';

class AddToLista extends createZodDto(addToListSchema) {}
class RemoveFromList extends createZodDto(removeFromListSchema) {}

@UseGuards(JwtAuthGuard)
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('/')
  async getLists(@Req() req, @Query() param: { skip: number; limit: number }) {
    return this.listService.getLists(req.user.id,param);
  }

  @Get('/:id')
  async getListById(@Param('id') id: number) {
    return this.listService.getListById(id);
  }

  @Post('/:id')
  async addToList(@Req() req, @Param('id') id: string,@Body() body: AddToLista
  ) {
    const parsed = addToListSchema.parse(body)
    await this.listService.addToList(body, Number(id),  req.user.id )
    return { message: 'Contenido agregado a la lista exitosamente' }
  }

  @Delete('/:id')
  async removeFromList(@Req() req, @Param('id') id: string, @Body() body: RemoveFromList) {
    const parsed = removeFromListSchema.parse(body)
    await this.listService.removeFromList( body,  Number(id),  req.user.id )
    return { message: 'Contenido eliminado de la lista exitosamente' }
  }
}