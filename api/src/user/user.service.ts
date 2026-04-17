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
}