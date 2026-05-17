import { BadRequestException, Injectable } from '@nestjs/common';
import { supabase } from 'src/config/db';
import {
  ReadListParam,
  readListParam
} from '../../../shared/list.schema';

@Injectable()
export class ListService {

  async getLists(
    userId: string,
    {
      skip,
      limit
    }: {
      skip: number;
      limit: number;
    }
  ) {

    const { data, error } = await supabase
      .from('lists_view')
      .select(`
        id,
        nombre_lista,
        nombre_usuario,
        enlace_imagen,
        tipo
      `)
      .order('id')
      .range(
        Number(skip) || 0,
        (Number(skip) || 0) +
        (Number(limit) || 15) - 1
      );

    if (error) {
      throw new BadRequestException(
        'Error fetching lists: ' + error.message
      );
    }

    // quitar repetidos
    const uniqueLists = Array.from(
      new Map(
        (data || []).map(item => [
          item.id,
          item
        ])
      ).values()
    );

    return uniqueLists;
  }

  async getListById(id: number) {

    const { data, error } = await supabase
      .from('lists_view')
      .select(`
        id,
        nombre_lista,
        nombre_usuario,
        enlace_imagen,
        contenido_id,
        tipo
      `)
      .eq('id', id);

    if (error) {
      throw new BadRequestException(
        'Error fetching list: ' + error.message
      );
    }

    return data;
  }

  async searchLists(param: ReadListParam) {

    const parsedParam =
      readListParam.parse(param);

    let query = supabase
      .from('lists_view')
      .select(`
        id,
        nombre_lista,
        nombre_usuario,
        enlace_imagen,
        tipo
      `)
      .order('id');

    // búsqueda nombre
    if (parsedParam.name) {

      query = query.ilike(
        'nombre_lista',
        `%${parsedParam.name}%`
      );
    }

    // filtro tipo
    if (parsedParam.type) {

      query = query.eq(
        'tipo',
        parsedParam.type
      );
    }

    // paginación
    if (
      parsedParam.skip !== undefined &&
      parsedParam.limit !== undefined
    ) {

      query = query.range(
        parsedParam.skip,
        parsedParam.skip +
        parsedParam.limit - 1
      );
    }

    const { data, error } =
      await query;

    if (error) {

      throw new BadRequestException(
        'Error searching lists: ' +
        error.message
      );
    }

    // quitar repetidos
    const uniqueLists = Array.from(
      new Map(
        (data || []).map(item => [
          item.id,
          item
        ])
      ).values()
    );

    return {
      data: uniqueLists
    };
  }
}