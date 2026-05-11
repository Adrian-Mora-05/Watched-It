import { Injectable, BadRequestException } from '@nestjs/common';
import { Multer } from 'multer';
import { supabase, supabaseAdmin } from '../config/db';
import { LogCatalogContent } from '../../../shared/catalog.schema';

@Injectable()
export class UserService {
  
  async uploadUserPic(file: Multer.File, userId: string) {

    const filePath = `${userId}/profile.png`; 
    await supabase.storage
      .from('profile_pics')
      .remove([filePath]);
      
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

  async removeProfilePicture(userId: string) {
    const filePath = `${userId}/profile.png`;

    await supabase.storage
      .from('profile_pics')
      .remove([filePath]);

    const { error } = await supabase
      .from('usuario')
      .update({
        enlace_foto_perfil: null,
      })
      .eq('id', userId);

    if (error) {
      throw new BadRequestException(
        `Database update failed: ${error.message}`
      );
    }

    return {
      message: 'Profile picture removed',
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

  async updateUserFavorites(
  userId: string,
  movies: number[],
  shows: number[]
) {

  // borrar películas anteriores
  const { error: moviesDeleteError } = await supabase
    .from('peliculas_favoritas_x_usuario')
    .delete()
    .eq('id_usuario', userId);

  if (moviesDeleteError) {
    throw new BadRequestException(
      `Deleting movie favorites failed: ${moviesDeleteError.message}`
    );
  }

  // borrar series anteriores
  const { error: showsDeleteError } = await supabase
    .from('series_favoritas_x_usuario')
    .delete()
    .eq('id_usuario', userId);

  if (showsDeleteError) {
    throw new BadRequestException(
      `Deleting show favorites failed: ${showsDeleteError.message}`
    );
  }

  // volver a insertar favoritos
  let { data, error } = await supabase
    .rpc('add_favorites', {
      id_pelicula1: movies[0] ?? null,
      id_pelicula2: movies[1] ?? null,
      id_pelicula3: movies[2] ?? null,
      id_serie1: shows[0] ?? null,
      id_serie2: shows[1] ?? null,
      id_serie3: shows[2] ?? null,
      id_usuario: userId
    });

  if (error) {
    throw new BadRequestException(
      `Updating favorites failed: ${error.message}`
    );
  }

  return data;
}

  async logContent(userId: string, logCatalogContent: LogCatalogContent) {

    let { data, error } = await supabase
      .rpc('log_content', {
        content: logCatalogContent.content,
        id_content: logCatalogContent.id_content,
        id_user: userId,
        rating: logCatalogContent.rating,
        type_content: logCatalogContent.type_content
      })

    if (error) {
      throw new BadRequestException(`Logging content failed: ${error.message}`);
    } else return data;

  }

  async getUserProfile(userId: string) {
    console.log('[getUserProfile] start, userId:', userId);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    console.log('[getUserProfile] authData:', authData?.user?.id, '| authError:', authError);
    if (authError) throw new BadRequestException(`Error fetching user: ${authError.message}`);

    const user = authData.user;

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('usuario')
      .select('enlace_foto_perfil')
      .eq('id', userId)
      .single();
    console.log('[getUserProfile] dbData:', dbData, '| dbError:', dbError);

    if (dbError && dbError.code !== 'PGRST116') throw new BadRequestException(`Error fetching profile: ${dbError.message}`);

    let profilePictureUrl: string | null = null;
    if (dbData?.enlace_foto_perfil) {
      const { data: urlData } = supabaseAdmin.storage
        .from('profile_pics')
        .getPublicUrl(dbData.enlace_foto_perfil);
      profilePictureUrl = urlData.publicUrl;
    }

    const result = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.nombre ?? null,
      profilePicture: profilePictureUrl,
      createdAt: user.created_at,
    };
    return result;
  }
}