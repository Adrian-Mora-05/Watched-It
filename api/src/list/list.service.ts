import { BadRequestException, Injectable } from '@nestjs/common';
import { supabase } from 'src/config/db';
import { CreateList, createListSchema, ReadListParam, readListParam} from '../../../shared/list.schema';

@Injectable()
export class ListService {

  async getLists(userId: string, { skip, limit }: { skip: number; limit: number }) {
    const { data, error } = await supabase
      .from('lists_view')
      .select('id, nombre_lista, nombre_usuario, enlace_imagen, contenido_id')
      .range(Number(skip) || 0, (Number(skip) || 0) + (Number(limit) || 15) - 1);

    if (error) throw new BadRequestException('Error fetching lists: ' + error.message);
    return data;
  }

  async getListById(id: number) {
    const { data, error } = await supabase
      .from('lists_view')
      .select('id, nombre_lista, nombre_usuario, enlace_imagen, contenido_id,tipo')
      .eq('id', id);

    if (error) throw new BadRequestException('Error fetching list: ' + error.message);
    return data;
  }

  async searchLists(param: ReadListParam) {

    const parsedParam = readListParam.parse(param);

    let query = supabase
      .from('lists_view')
      .select(`
        id,
        nombre_lista,
        nombre_usuario,
        enlace_imagen,
        contenido_id,
        tipo
      `);

    if (parsedParam.name) {
      query = query.ilike('nombre_lista', `%${parsedParam.name}%`);
    }

    if (parsedParam.type) {
      query = query.eq('tipo', parsedParam.type);
    }

    if (
      parsedParam.skip !== undefined &&
      parsedParam.limit !== undefined
    ) {
      query = query.range(
        parsedParam.skip,
        parsedParam.skip + parsedParam.limit - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        'Error searching lists: ' + error.message
      );
    }

    return { data };
  }


}