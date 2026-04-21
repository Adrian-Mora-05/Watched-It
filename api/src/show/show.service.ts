import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { readShowParam, ReadShowParam } from "../../../shared/show.schema";

@Injectable()
export class ShowService {
    async getAllShows(param: ReadShowParam) {
        const parsedParam = readShowParam.parse(param);

        let query = supabase
            .from('serie')
            .select('id:id, title:titulo, image_link:enlace_imagen') 

        if (parsedParam.skip !== undefined && parsedParam.limit !== undefined) query = query.range(parsedParam.skip, parsedParam.skip + parsedParam.limit - 1)    
        if (parsedParam.title)                          query = query.ilike('titulo', `%${parsedParam.title}%`)
        if (parsedParam.year !== undefined)             query = query.eq('anio_inicio', parsedParam.year)
        if (parsedParam.genre !== undefined)            query = query.eq('genero', parsedParam.genre)
        if (parsedParam.ageRestriction !== undefined)   query = query.is('restriccion_edad', parsedParam.ageRestriction)

        const { data: pelicula, error } = await query
        if (error) throw new BadRequestException(error.message)
        return { data: pelicula }
    }
}