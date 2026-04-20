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
            .range(parsedParam.skip, parsedParam.skip + parsedParam.limit - 1)
            
        if (parsedParam.title)                          query = query.ilike('titulo', `%${parsedParam.title}%`)
        if (parsedParam.year !== undefined)             query = query.eq('anio', parsedParam.year)
        if (parsedParam.genre !== undefined)            query = query.eq('genero', parsedParam.genre)
        if (parsedParam.ageRestriction !== undefined)   query = query.is('restriccion_edad', parsedParam.ageRestriction)

        const { data: pelicula, error } = await query
        if (error) throw new BadRequestException(error.message)
        return { data: pelicula }
    }
}