import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";

@Injectable()
export class ReviewService {

    async getAllReviews(userId: string, { skip, limit }: { skip: number; limit: number }) {
        const { data, error } = await supabase
        .rpc('get_reviews', { 
            p_id_usuario: userId,
            p_skip: Number(skip),   
            p_limit: Number(limit) 
        });

        if (error) {
            throw new BadRequestException('Error fetching reviews:'+ error.message);
        }
        return data;
    }
    async addLike(userId: string, idComentario: number, tipo: string) {
        const { error } = await supabase
            .rpc('add_like', {
                p_id_usuario: userId,
                p_id_comentario: idComentario,
                p_tipo: tipo
            });

        if (error) {
            console.log(error);
            throw new BadRequestException('Error adding like:' + error.message);
        }
        return { message: 'Like added successfully' };
    }

    async removeLike(userId: string, idComentario: number, tipo: string) {
        const { error } = await supabase
            .rpc('remove_like', {
                p_id_usuario: userId,
                p_id_comentario: idComentario,
                p_tipo: tipo
            });
        if (error) {
            console.log(error);
            throw new BadRequestException('Error removing like:' + error.message);
        }
        return { message: 'Like removed successfully' };
    }

    async getReviewById(id: number) {
        const { data, error } = await supabase
            .from('get_all_reviews')
            .select('*')
            .eq('id', id)
            .range(0, 9)

        if (error) {
            throw new BadRequestException('Error fetching review:' + error.message);
        }
        return data;
    }


}
