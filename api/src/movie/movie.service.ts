import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import {  ReadMovie } from "../../../shared/movie.schema";

@Injectable()
export class MovieService {
    async getAllMovies(data: ReadMovie) {
        let query = supabase
            .from('pelicula')
            .select('*')
            .range(data.skip, data.limit)
            .ilike('titulo', `%${data.titulo}%`)

        if (data.anio !== undefined)           query = query.eq('anio', data.anio)
        if (data.genero !== undefined)         query = query.eq('genero', data.genero)
        if (data.restriccionEdad !== undefined) query = query.is('restriccion_edad', data.restriccionEdad)

        let { data: pelicula, error } = await query

        if (error) throw new BadRequestException(error.message)

        return { data: pelicula }
    }

}