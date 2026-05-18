import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { GetMovieReviews, readMovieParam, ReadMovieParam } from "../../../shared/movie.schema";


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

async getMovieById(id: number, id_user: string, name: string) {
  const [{ data: movie, error }, [{ count }, resenas]] = await Promise.all([
    supabase
      .from('pelicula')
      .select(`
        id, titulo, anio, pais, duracion, genero, restriccion_edad, sinopsis, enlace_imagen,
        calificaciones_pelicula_view (*)
      `)
      .eq('id', id)
      .single(),
    Promise.all([
      supabase
        .from('watchlist_view')
        .select('*', { count: 'exact', head: true })
        .eq('id_usuario', id_user)
        .eq('tipo', 'pelicula')
        .eq('contenido_id', id),
      this.getMovieReviews(id, { skip: 0, limit: 3, id_usuario: id_user })
    ])
  ]);

  if (error) throw new BadRequestException(error.message);

  return {
    ...movie,
    isInWatchlist: count! > 0,
    resenas
  };
}
    async getMovieReviews(id_pelicula: number,  { skip, limit,id_usuario }: GetMovieReviews) {
        const { data, error } = await supabase
            .from('get_all_movie_reviews_view')
            .select('*')
            .eq('id_pelicula', id_pelicula)
            .order('cant_me_gusta',{ ascending: false })
            .range(skip, skip + limit - 1)

        if (error) throw new BadRequestException(error.message)
        return data.map(review => {
        return {
            ...review,
            liked: review.usuarios_que_dieron_like?.includes(id_usuario) ?? false
        }
        })
    }
}
