import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { readMovieParam, ReadMovieParam } from "../../../shared/movie.schema";

@Injectable()
export class MovieService {
async getAllMovies(param: ReadMovieParam) {

    const parsedParam = readMovieParam.parse(param);

    let query = supabase
        .from('pelicula')
        .select(`
            id:id,
            title:titulo,
            image_link:enlace_imagen,
            anio,
            popularidad,
            genero,
            duracion
        `);

    // paginación
    if (
        parsedParam.skip !== undefined &&
        parsedParam.limit !== undefined
    ) {
        query = query.range(
            parsedParam.skip,
            parsedParam.skip + parsedParam.limit - 1
        );
    }

    // búsqueda por título
    if (parsedParam.title) {
        query = query.ilike(
            'titulo',
            `%${parsedParam.title}%`
        );
    }

    // año
    if (parsedParam.year !== undefined) {
        query = query.eq(
            'anio',
            parsedParam.year
        );
    }

    // país
    if (parsedParam.country !== undefined) {
        query = query.ilike(
            'pais',
            `%${parsedParam.country}%`
        );
    }

    // múltiples géneros
    if (parsedParam.genres) {

        const genreList = parsedParam.genres
            .split(',')
            .map(g => g.trim());

        query = query.in(
            'genero',
            genreList
        );
    }

    // restricción edad
    if (parsedParam.ageRestriction !== undefined) {
        query = query.eq(
            'restriccion_edad',
            parsedParam.ageRestriction
        );
    }

    // duración mínima
    if (parsedParam.minLength !== undefined) {
        query = query.gte(
            'duracion',
            parsedParam.minLength
        );
    }

    // duración máxima
    if (parsedParam.maxLength !== undefined) {
        query = query.lte(
            'duracion',
            parsedParam.maxLength
        );
    }

    // ordenamiento
    if (parsedParam.sortBy) {

        const columnMap = {
            popularity: 'popularidad',
            year: 'anio',
            title: 'titulo'
        };

        query = query.order(
            columnMap[parsedParam.sortBy],
            {
                ascending: parsedParam.order === 'asc'
            }
        );
    }

    const { data: pelicula, error } = await query;

    if (error) {
        throw new BadRequestException(error.message);
    }

    return { data: pelicula };
}
    
async getFavoriteMoviesByUser(token: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (!user || authError) {
    throw new BadRequestException('No autorizado');
  }

  const { data, error } = await supabase
    .from('peliculas_favoritas_x_usuario')
    .select(`
      pelicula:id_pelicula (
        id:id,
        title:titulo,
        image_link:enlace_imagen
      )
    `)
    .eq('id_usuario', user.id);
        
  if (error) throw new BadRequestException(error.message);
  return data.map(p => p.pelicula);
  
}

async getMovieById(id: number) {

    const { data: movie, error } = await supabase
        .from('pelicula')
        .select(` id, titulo, anio, pais, duracion, genero, restriccion_edad, sinopsis, enlace_imagen`)
        .eq('id', id)

    if (error) {
        throw new BadRequestException(error.message);
    }

    const { data: calificaciones } = await supabase
        .from('calificaciones_pelicula_view')
        .select('*')
        .eq('id_pelicula', id);


    let query= supabase
        .from('resenas_principales_peliculas_view')
        .select('*')
        .eq('id_pelicula', id);
    query.range(0, 3); //solo 3 reseñas principales

    const { data:resenas } = await query

    return {
        ...movie,
        calificaciones, resenas
    };
}

async getMovieReviews(id: number) {

    const { data, error } = await supabase
        .from('comentario_x_pelicula')
        .select(`
            id,
            contenido,
            cant_me_gusta,
            calificacion_x_pelicula (
                calificacion,
                usuario:id_usuario (
                    nombre
                )
            )
        `)
        .eq('calificacion_x_pelicula.id_pelicula', id);

    if (error) {
        throw new BadRequestException(error.message);
    }

    return { data };
}


}
