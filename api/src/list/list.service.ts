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
      .select('id, nombre_lista, nombre_usuario, enlace_imagen, contenido_id')
      .eq('id', id);

    if (error) throw new BadRequestException('Error fetching list: ' + error.message);
    return data;
  }

  async createList(
    userId: string,
    body: CreateList
  ) {

    const parsedBody = createListSchema.parse(body);

    const { data: listData, error: listError } =
      await supabase
        .from('lista_peliculas')
        .insert({
          nombre: parsedBody.name,
          id_usuario: userId
        })
        .select()
        .single();

    if (listError) {
      throw new BadRequestException(listError.message);
    }

    if (parsedBody.movieIds.length > 0) {

      const rows = parsedBody.movieIds.map(movieId => ({
        id_lista: listData.id,
        id_pelicula: movieId
      }));

      const { error: relationError } = await supabase
        .from('pelicula_x_lista')
        .insert(rows);

      if (relationError) {
        throw new BadRequestException(
          relationError.message
        );
      }
    }

    return {
      message: 'Lista creada correctamente',
      data: listData
    };
  }
}