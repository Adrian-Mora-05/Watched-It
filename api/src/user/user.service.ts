import { Injectable, BadRequestException } from '@nestjs/common';
import { Multer } from 'multer';
import { supabase, supabaseAdmin } from '../config/db';
import { LogCatalogContent } from '../../../shared/catalog.schema';
import { ReadUserParam, readUserParam } from '../../../shared/user.schema';

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

 async updateUserFavorites(userId: string, movies: number[], shows: number[]) {
  const { error } = await supabase.rpc('update_favorites', {
    p_id_usuario: userId,
    p_movies: movies.length > 0 ? movies : null,
    p_shows: shows.length > 0 ? shows : null,
  });

  if (error) {
    throw new BadRequestException(`Updating favorites failed: ${error.message}`);
  }
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

  async updateLogContent(
    userId: string,
    logId: number,
    body: {
      content?: string;
      rating: number;
      type_content: string;
    }
  ) {

    const { data, error } = await supabase.rpc('update_log_content', {
      p_id_user: userId,
      p_id_log: logId,
      p_type_content: body.type_content,
      p_rating: body.rating,
      p_content: body.content ?? null,
    });

    if (error) {
      throw new BadRequestException(
        `Updating log content failed: ${error.message}`
      );
    }

    return {
      message: 'Log updated successfully',
      data,
    };
  }
  async deleteLogContent(
    userId: string,
    logId: number,
    typeContent: string
  ) {
    const { data, error } = await supabase.rpc('delete_log_content', {
      p_id_user: userId,
      p_id_log: logId,
      p_type_content: typeContent,
    });

    if (error) {
      throw new BadRequestException(
        `Deleting log failed: ${error.message}`
      );
    }

    return { message: 'Log deleted successfully' };
  }
  
async getUserLogById(userId: string, logId: number, typeContent: string) {
  const isMovie = typeContent?.toLowerCase().trim() === 'movie';

  const ratingsTable = isMovie
    ? 'calificacion_x_pelicula'
    : 'calificacion_x_serie';

  const contentTable = isMovie ? 'pelicula' : 'serie';

  const dateColumn = isMovie ? 'fecha_creado' : 'fecha_creacion';

  const commentTable = isMovie
    ? 'comentario_x_pelicula'
    : 'comentario_x_serie';

  const { data, error } = await supabase
    .from(ratingsTable)
    .select(`
      id,
      calificacion,
      ${dateColumn},
      ${contentTable} (
        id,
        titulo,
        enlace_imagen,
        ${isMovie ? 'anio' : 'anio_inicio'}
      ),
      ${commentTable} (
        id,
        contenido,
        cant_me_gusta
      )
    `)
    .eq('id', logId)
    .eq('id_usuario', userId)
    .maybeSingle();

  if (error) {
    throw new BadRequestException(error.message);
  }

  if (!data) {
    throw new BadRequestException("Log not found");
  }

  const content = Array.isArray(data[contentTable])
    ? data[contentTable][0]
    : data[contentTable];

  const comment = Array.isArray(data[commentTable])
    ? data[commentTable][0]
    : data[commentTable];

  return {
    id: data.id,
    type: isMovie ? 'movie' : 'series',

    rating: data.calificacion,
    date: data[dateColumn],

    content: comment?.contenido ?? "",
    likes: comment?.cant_me_gusta ?? 0,
    

    catalog: {
      id: content?.id,
      title: content?.titulo,
      poster: content?.enlace_imagen,
      year: isMovie ? content?.anio : content?.anio_inicio,
    }
    
  };
}

  async getUserProfile(userId: string) {

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (authError) throw new BadRequestException(`Error fetching user: ${authError.message}`);

    const user = authData.user;

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('usuario')
      .select('enlace_foto_perfil')
      .eq('id', userId)
      .single();

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

async searchUsers(param: ReadUserParam) {

  const parsedParam =
    readUserParam.parse(param);

  let query = supabase
    .from('usuario')
    .select(`
      id,
      nombre,
      enlace_foto_perfil
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

  // búsqueda parcial
  if (parsedParam.name) {

    query = query.ilike(
      'nombre',
      `%${parsedParam.name}%`
    );
  }

  // ordenar alfabéticamente
  query = query.order(
    'nombre',
    { ascending: true }
  );

  const { data, error } = await query;

  if (error) {
    throw new BadRequestException(
      error.message
    );
  }

  return { data };
}

async getRatingStats(userId: string) {
  const { data, error } = await supabase
    .from('calificaciones_usuario_view')
    .select('*')
    .eq('id_usuario', userId)
    .maybeSingle();

  if (error) {
    throw new BadRequestException(`Error fetching rating stats: ${error.message}`);
  }

  return data ?? {
    total_calificaciones: 0,
    cant_1: 0,
    cant_2: 0,
    cant_3: 0,
    cant_4: 0,
    cant_5: 0,
  };
}



}
