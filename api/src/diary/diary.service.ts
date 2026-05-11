import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { GetDiaryEntriesSchema, getDiaryEntriesSchema } from "../../../shared/diary.schema";

@Injectable()
export class DiaryService {

    async getDiaryEntries(
        param: GetDiaryEntriesSchema,
        userId: string
    ) {

        const parsedParam =
            getDiaryEntriesSchema.parse(param);

        let movieQuery = supabase
            .from('calificacion_x_pelicula')
            .select(`
                id,
                fecha_creado,
                calificacion,

                pelicula (
                    id,
                    titulo,
                    enlace_imagen,
                    anio
                )
            `)
            .eq('id_usuario', userId);

        let showQuery = supabase
            .from('calificacion_x_serie')
            .select(`
                id,
                fecha_creado:fecha_creacion,
                calificacion,

                serie (
                    id,
                    titulo,
                    enlace_imagen,
                    anio:anio_inicio
                )
            `)
            .eq('id_usuario', userId);

        // FILTER BY RATING

        if (parsedParam.rating) {

            movieQuery = movieQuery.eq(
                'calificacion',
                parsedParam.rating
            );

            showQuery = showQuery.eq(
                'calificacion',
                parsedParam.rating
            );
        }

        const {
            data: movies,
            error: movieError
        } = await movieQuery;

        const {
            data: shows,
            error: showError
        } = await showQuery;

        if (movieError) {
            throw new BadRequestException(
                movieError.message
            );
        }

        if (showError) {
            throw new BadRequestException(
                showError.message
            );
        }

        const combinedDiary = [

            ...(movies || []).map((movie) => ({
                id: movie.id,
                type: 'movie',

                fecha_creado:
                    movie.fecha_creado,

                calificacion:
                    movie.calificacion,

                content:
                    movie.pelicula
            })),

            ...(shows || []).map((show) => ({
                id: show.id,
                type: 'series',

                fecha_creado:
                    show.fecha_creado,

                calificacion:
                    show.calificacion,

                content:
                    show.serie
            }))
        ];

        combinedDiary.sort((a, b) => {

            const dateA =
                new Date(a.fecha_creado)
                    .getTime();

            const dateB =
                new Date(b.fecha_creado)
                    .getTime();

            return parsedParam.sort_order === 'asc'
                ? dateA - dateB
                : dateB - dateA;
        });

        const paginatedDiary =
            combinedDiary.slice(
                parsedParam.skip,
                parsedParam.skip +
                parsedParam.limit
            );

        return {
            data: paginatedDiary
        };
    }
}