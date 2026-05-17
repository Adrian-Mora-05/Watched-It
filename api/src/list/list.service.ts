import { BadRequestException, Injectable } from '@nestjs/common';
import { supabase } from 'src/config/db';
import { AddToList, RemoveFromList, ReadListParam, readListParam, CreateList, DeleteList, RenameList } from '../../../shared/list.schema'

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

  async addToList({  tipo, nombre_lista }: AddToList, id_contenido: number,id_usuario: string  ) {
    const { error } = await supabase.rpc('add_to_list', {
      p_id_usuario:   id_usuario,
      p_id_contenido: id_contenido,
      p_tipo:         tipo,
      p_nombre_lista: nombre_lista
    })

    if (error) throw new BadRequestException(error.message)
}
// service
async removeFromList({ tipo, nombre_lista }: RemoveFromList, id_contenido: number,id_usuario:string ) {
  const { error } = await supabase.rpc('remove_from_list', {
    p_id_usuario:   id_usuario,
    p_id_contenido: id_contenido,
    p_tipo:         tipo,
    p_nombre_lista: nombre_lista
  })

  if (error) throw new BadRequestException(error.message)
}

  async getUserLists(userId: number,param: ReadListParam, ) {
    const { data, error } = await supabase
      .from('lists_by_user_view')
      .select('*')
      .eq('id_usuario', userId)
      .range(
        param.skip!,
        param.skip! + param.limit! - 1
      );

    if (error) {
        throw new BadRequestException(error.message );
      }
    return data;
  }

  async getPorVer(userId: string, { skip, limit }: { skip: number; limit: number }) {
    const from = Number(skip) || 0;
    const to = from + (Number(limit) || 15) - 1;
    const { data, error } = await supabase
      .from('watchlist_view')
      .select(`*`)
      .eq('id_usuario', userId)
      .range(from, to);

    if (error) {
      throw new BadRequestException(
        'Error fetching por_ver list: ' + error.message
      );
    }
    return data;
  }

  async createList(
    userId: string,
    body: CreateList
  ) {
    if (body.nombre_lista.toLowerCase().trim() === 'por_ver') {
      throw new BadRequestException('El nombre "por_ver" está reservado');
    }

    const { data, error } = await supabase.rpc('create_list', {
      p_id_usuario: userId,
      p_nombre_lista: body.nombre_lista,
      p_tipo: body.tipo,
      p_id_contenido: body.id_contenido ?? null,
    });

    if (error) throw new BadRequestException('Error creating list: ' + error.message);

    return { message: 'Lista creada exitosamente', id: data };
  }

  async deleteList(userId: string, body: DeleteList) {
    if (body.nombre_lista.toLowerCase().trim() === 'por_ver') {
      throw new BadRequestException('La lista "por_ver" no puede eliminarse');
    }

    const { error } = await supabase.rpc('delete_list', {
      p_id_usuario: userId,
      p_nombre_lista: body.nombre_lista,
      p_tipo: body.tipo,
    });

    if (error) throw new BadRequestException('Error deleting list: ' + error.message);

    return { message: 'Lista eliminada exitosamente' };
  }

  async renameList(userId: string, body: RenameList) {
    if (body.nombre_lista.toLowerCase().trim() === 'por_ver') {
      throw new BadRequestException('La lista "por_ver" no puede renombrarse');
    }

    const { error } = await supabase.rpc('rename_list', {
      p_id_usuario: userId,
      p_nombre_lista: body.nombre_lista,
      p_nuevo_nombre: body.nuevo_nombre,
      p_tipo: body.tipo,
    });

    if (error) throw new BadRequestException('Error renaming list: ' + error.message);

    return { message: 'Lista renombrada exitosamente' };
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