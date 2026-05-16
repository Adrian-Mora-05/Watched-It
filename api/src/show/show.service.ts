import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { readShowParam, ReadShowParam } from "../../../shared/show.schema";

@Injectable()
export class ShowService {
async getAllShows(param: ReadShowParam) {

    const parsedParam = readShowParam.parse(param);

    let query = supabase
        .from('serie')
        .select(`
            id:id,
            title:titulo,
            image_link:enlace_imagen,
            anio_inicio,
            popularidad,
            genero
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
            'anio_inicio',
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
    // género
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

    // ordenamiento
    if (parsedParam.sortBy) {

        const columnMap = {
            popularity: 'popularidad',
            year: 'anio_inicio',
            title: 'titulo'
        };

        query = query.order(
            columnMap[parsedParam.sortBy],
            {
                ascending: parsedParam.order === 'asc'
            }
        );
    }

    const { data: series, error } = await query;

    if (error) {
        throw new BadRequestException(error.message);
    }

    return { data: series };
}

    async getFavoriteShowsByUser(token: string) {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (!user || authError) {
            throw new BadRequestException('No autorizado');
        }

        const { data, error } = await supabase
            .from('series_favoritas_x_usuario')
            .select(`
            serie:id_serie (
                id:id,
                title:titulo,
                image_link:enlace_imagen
            )
            `)
            .eq('id_usuario', user.id);
                
        if (error) throw new BadRequestException(error.message);
        return data.map(p => p.serie);
    }


    // NUEVO — detalle serie
    async getShowById(id: number) {

        const { data: show, error } = await supabase
            .from('serie')
            .select(`
                id,
                titulo,
                anio_inicio,
                anio_fin,
                pais,
                cant_temporadas,
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
            .from('calificacion_x_serie')
            .select('calificacion')
            .eq('id_serie', id);

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
            .from('comentario_x_serie')
            .select(`
                id,
                contenido,
                cant_me_gusta,
                calificacion_x_serie (
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
            show,
            ratings_distribution: distribution,
            top_review: topReview
        };
    }

    // NUEVO — reviews serie
    async getShowReviews(id: number) {

        const { data, error } = await supabase
            .from('comentario_x_serie')
            .select(`
                id,
                contenido,
                cant_me_gusta,
                calificacion_x_serie (
                    calificacion,
                    usuario:id_usuario (
                        nombre
                    )
                )
            `)
            .eq('calificacion_x_serie.id_serie', id);

        if (error) {
            throw new BadRequestException(error.message);
        }

        return { data };
    }

}
