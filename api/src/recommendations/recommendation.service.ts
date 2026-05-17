import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";

@Injectable()
export class RecommendationService {

    async generateAllRecommendations(userId: string, contenido: 'pelicula' | 'serie') {
        const favoritasTable = contenido === 'pelicula'
            ? 'peliculas_favoritas_x_usuario'
            : 'series_favoritas_x_usuario'
        const idColumn = contenido === 'pelicula' ? 'id_pelicula' : 'id_serie'

        const { data: favorites, error: favError } = await supabase
            .from(favoritasTable)
            .select(idColumn)
            .eq('id_usuario', userId)

        if (favError) throw new BadRequestException(favError.message);
        if (!favorites || favorites.length === 0) throw new BadRequestException('No tienes favoritos');

        const contentIds = favorites.map(f => f[idColumn]);

        const rpcNames = contenido === 'pelicula'
            ? ['recommend_movies', 'hidden_gems', 'world_cinema']
            : ['recommend_series', 'hidden_gems_series', 'world_cinema_series']

        const [paraTi, joyaOculta, cineMundial] = await Promise.all([
            supabase.rpc(rpcNames[0], { movie_ids: contentIds, match_count: 10 }),
            supabase.rpc(rpcNames[1], { movie_ids: contentIds, match_count: 10 }),
            supabase.rpc(rpcNames[2], { movie_ids: contentIds, match_count: 10 }),
        ]);

        if (paraTi.error) throw new BadRequestException(paraTi.error.message);
        if (joyaOculta.error) throw new BadRequestException(joyaOculta.error.message);
        if (cineMundial.error) throw new BadRequestException(cineMundial.error.message);

        const { error: deleteError } = await supabase
            .from('recomendacion')
            .delete()
            .eq('id_usuario', userId)
            .eq('contenido', contenido)

        if (deleteError) throw new BadRequestException(deleteError.message);

        const records = [
            ...paraTi.data.map(r => ({ id_usuario: userId, id_contenido: r.id, similitud: r.similarity, tipo: 'para_ti', contenido })),
            ...joyaOculta.data.map(r => ({ id_usuario: userId, id_contenido: r.id, similitud: r.similarity, tipo: 'joya_oculta', contenido })),
            ...cineMundial.data.map(r => ({ id_usuario: userId, id_contenido: r.id, similitud: r.similarity, tipo: 'cine_mundial', contenido })),
        ];

        const { error: insertError } = await supabase
            .from('recomendacion')
            .insert(records)

        if (insertError) throw new BadRequestException(insertError.message);

        return { message: 'Recomendaciones generadas exitosamente', total: records.length };
    }
async getByType(userId: string, tipo: string, contenido: 'pelicula' | 'serie') {
    const { data: recomendaciones, error } = await supabase
        .from('recomendacion')
        .select('id_contenido, similitud')
        .eq('id_usuario', userId)
        .eq('tipo', tipo)
        .eq('contenido', contenido)
        .order('similitud', { ascending: false });

    if (error) throw new BadRequestException(error.message);

    const ids = recomendaciones.map(r => r.id_contenido);
    const table = contenido === 'pelicula' ? 'pelicula' : 'serie';

    const { data: content, error: contentError } = await supabase
        .from(table)
        .select('id, title:titulo, image_link:enlace_imagen')
        .in('id', ids);

    if (contentError) throw new BadRequestException(contentError.message);

    return recomendaciones.map(r => ({
        ...content.find(c => c.id === r.id_contenido),
        similitud: r.similitud
    }));
}
}