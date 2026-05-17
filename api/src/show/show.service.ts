import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { readShowParam, ReadShowParam, getshowReviewsSchema, GetShowReviews } from "../../../shared/show.schema";

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

    async getShowById(id: number,id_user:string, name:string) {

        const { data: show, error } = await supabase
            .from('serie')
            .select(` id, titulo, anio_inicio,anio_fin, pais, cant_temporadas, genero, restriccion_edad, sinopsis, enlace_imagen`)
            .eq('id', id)

        if (error) {
            throw new BadRequestException(error.message);
        }

        const { data: calificaciones } = await supabase
            .from('calificaciones_serie_view')
            .select('*')
            .eq('id_serie', id);

        const { count } = await supabase
            .from('watchlist_view')
            .select('*', { count: 'exact', head: true })  
            .eq('id_usuario', id_user)
            .eq('tipo', 'serie')
            .eq('contenido_id', id)
        const isInWatchlist = count! > 0

        const { data: allResenas } = await supabase
        .rpc('get_reviews', {
            p_id_usuario: id_user,
            p_skip: 0,
            p_limit: 1000000
        })

        const resenas = allResenas
            ?.filter(r => r.tipo === 'serie' && r.titulo === show[0].titulo)
            .slice(0, 3) ?? []

        return {
            ...show, isInWatchlist,
            calificaciones, resenas
        };
    }

    async getshowReviews(id_serie: number,  { skip, limit,id_usuario }: GetShowReviews) {
        const { data, error } = await supabase
            .from('get_all_show_reviews_view')
            .select('*')
            .eq('id_serie', id_serie)
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
