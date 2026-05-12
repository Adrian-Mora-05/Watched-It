import {
  BadRequestException,
  Injectable
} from '@nestjs/common';

import { supabase } from 'src/config/db';

import {
  CreateList,
  createListSchema,
  ReadListParam,
  readListParam
} from '../../../shared/list.schema';

@Injectable()
export class ListService {

  async getAllLists(param: ReadListParam) {

    const parsedParam = readListParam.parse(param);

    let query = supabase
      .from('lista_peliculas')
      .select(`
        id,
        nombre,
        fecha_creacion,
        usuario:id_usuario (
          id,
          nombre
        )
      `);

    if (parsedParam.skip !== undefined &&
        parsedParam.limit !== undefined) {

      query = query.range(
        parsedParam.skip,
        parsedParam.skip + parsedParam.limit - 1
      );
    }

    if (parsedParam.name) {
      query = query.ilike(
        'nombre',
        `%${parsedParam.name}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { data };
  }

  async getListById(id: number) {

    const { data, error } = await supabase
      .from('lista_peliculas')
      .select(`
        id,
        nombre,
        fecha_creacion,

        usuario:id_usuario (
          id,
          nombre
        ),

        pelicula_x_lista (
          pelicula:id_pelicula (
            id,
            titulo,
            enlace_imagen
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      data: {
        id: data.id,
        nombre: data.nombre,
        fecha_creacion: data.fecha_creacion,
        usuario: data.usuario,
        peliculas:
          data.pelicula_x_lista.map((p: any) => p.pelicula)
      }
    };
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