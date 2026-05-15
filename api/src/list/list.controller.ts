import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ListService } from './list.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { createZodDto } from 'nestjs-zod';
import { addToListSchema,  removeFromListSchema, readListParam, createListSchema, deleteListSchema, renameListSchema  } from '../../../shared/list.schema';

class AddToLista extends createZodDto(addToListSchema) {}
class RemoveFromList extends createZodDto(removeFromListSchema) {}
class ReadListParamDto extends createZodDto(readListParam) {}
class CreateListDto extends createZodDto(createListSchema) {}
class DeleteListDto extends createZodDto(deleteListSchema) {}
class RenameListDto extends createZodDto(renameListSchema) {}

@UseGuards(JwtAuthGuard)
@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @Get('/')
  async getLists(@Req() req, @Query() param: { skip: number; limit: number }) {
    return this.listService.getLists(req.user.id,param);
  }

  @Get('/user-lists')
  async getUserLists( @Req() req, @Query() param: ReadListParamDto,) {
    return this.listService.getUserLists(
      req.user.id,
      param,
    );
  }

  @Get('/por-ver')
  async getPorVer( @Req() req, @Query() param: { skip: number; limit: number }) {
    return this.listService.getPorVer(req.user.id, param);
  }

  @Post('/')
  async createList(@Req() req, @Body() body: CreateListDto) {
    createListSchema.parse(body);
    return this.listService.createList(req.user.id, body);
  }

  @Delete('/')
  async deleteList(@Req() req, @Body() body: DeleteListDto) {
    deleteListSchema.parse(body);
    return this.listService.deleteList(req.user.id, body);
  }

  @Patch('/')
  async renameList(@Req() req, @Body() body: RenameListDto) {
    renameListSchema.parse(body);
    return this.listService.renameList(req.user.id, body);
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