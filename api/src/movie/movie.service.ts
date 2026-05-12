import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { readMovieParam, ReadMovieParam } from "../../../shared/movie.schema";

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

async getMovieById(id: number) {

    const { data: movie, error } = await supabase
        .from('pelicula')
        .select(`
            id,
            titulo,
            anio,
            pais,
            duracion,
            genero,
            restriccion_edad,
            sinopsis,
            enlace_imagen
        `)
        .eq('id', id)
        .single();

    if (error) {
        throw new BadRequestException(error.message);
    }

    // ratings
    const { data: ratings } = await supabase
        .from('calificacion_x_pelicula')
        .select('calificacion')
        .eq('id_pelicula', id);

    const distribution = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
    };

    ratings?.forEach(r => {
        distribution[r.calificacion as keyof typeof distribution]++;
    });

    // top review
    const { data: topReview } = await supabase
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
        .order('cant_me_gusta', { ascending: false })
        .limit(1)
        .single();

    return {
        movie,
        ratings_distribution: distribution,
        top_review: topReview
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
