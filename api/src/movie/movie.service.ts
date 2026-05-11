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

        const { data: pelicula, error } = await query
        if (error) throw new BadRequestException(error.message)
        return { data: pelicula }
    }
    
async getFavoriteMoviesByUser(token: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (!user || authError) {
    throw new BadRequestException('No autorizado');
  }

  console.log("TOKEN:", token);

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
}