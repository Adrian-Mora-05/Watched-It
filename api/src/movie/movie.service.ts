import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { GetMovieReviews, readMovieParam, ReadMovieParam } from "../../../shared/movie.schema";


@Injectable()
export class MovieService {
    async getAllMovies(param: ReadMovieParam) {
        const parsedParam = readMovieParam.parse(param);

        let query = supabase
            .from('pelicula')
            .select('id:id, title:titulo, image_link:enlace_imagen') 

        if (parsedParam.skip !== undefined && parsedParam.limit !== undefined) query = query.range(parsedParam.skip, parsedParam.skip + parsedParam.limit - 1)    
        if (parsedParam.title)                          query = query.ilike('titulo', `%${parsedParam.title}%`)
        if (parsedParam.year !== undefined)             query = query.eq('anio', parsedParam.year)
        if (parsedParam.genre !== undefined)            query = query.eq('genero', parsedParam.genre)
        if (parsedParam.ageRestriction !== undefined)   query = query.is('restriccion_edad', parsedParam.ageRestriction)
        if (parsedParam.length !== undefined)           query = query.eq('duracion', parsedParam.length)
        if (parsedParam.country !== undefined)          query = query.eq('pais', parsedParam.country)  

        const { data: pelicula, error } = await query
        if (error) throw new BadRequestException(error.message)
        return { data: pelicula }
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

async getMovieById(id: number,id_user:string, name:string) {

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

    const { count } = await supabase
        .from('watchlist_view')
        .select('*', { count: 'exact', head: true })  
        .eq('id_usuario', id_user)
        .eq('tipo', 'pelicula')
        .eq('contenido_id', id)
    const isInWatchlist = count! > 0

    const { data: allResenas } = await supabase
    .rpc('get_reviews', {
        p_id_usuario: id_user,
        p_skip: 0,
        p_limit: 1000000
    })

    const resenas = allResenas
        ?.filter(r => r.tipo === 'pelicula' && r.titulo === movie[0].titulo)
        .slice(0, 3) ?? []

    return {
        ...movie, isInWatchlist,
        calificaciones, resenas
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
