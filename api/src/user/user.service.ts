import { Injectable, BadRequestException } from '@nestjs/common';
import { Multer } from 'multer';
import { supabase } from '../config/db';

@Injectable()
export class UserService {
  
  async uploadUserPic(file: Multer.File, userId: string) {

    const filePath = `${userId}/profile.png`; 
    const { data, error } = await supabase.storage
      .from('profile_pics') 
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true, // diego goes crazy
      });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { error: dbError } = await supabase
      .from('usuario')
      .update({ enlace_foto_perfil: filePath })
      .eq('id', userId);

    if (dbError) {
      throw new BadRequestException(`Database update failed: ${dbError.message}`);
    }

    return {
      message: 'Profile picture updated successfully',
      path: data.path,
    };
  }

  async addUserFavoriteContent(userId: string, movies: number[], shows:number[]) {
                                
    let { data, error } = await supabase
      .rpc('add_favorites', {
        id_pelicula1: movies[0], 
        id_pelicula2: movies[1] , 
        id_pelicula3: movies[2], 
        id_serie1: shows[0], 
        id_serie2: shows[1], 
        id_serie3: shows[2], 
        id_usuario: userId
      })

    if (error) {
      throw new BadRequestException(`Adding favorites failed: ${error.message}`);
    } else return data;

  }
}