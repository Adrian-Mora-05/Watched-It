import { BadRequestException, Injectable } from '@nestjs/common';
import { supabase } from 'src/config/db';
import { AddToList, RemoveFromList } from '../../../shared/list.schema'

@Injectable()
export class ListService {

  async getLists(userId: string, { skip, limit }: { skip: number; limit: number }) {
    const { data, error } = await supabase
      .from('lists_view')
      .select('id, nombre_lista, nombre_usuario, enlace_imagen, contenido_id')
      .range(Number(skip) || 0, (Number(skip) || 0) + (Number(limit) || 15) - 1);

    if (error) throw new BadRequestException('Error fetching lists: ' + error.message);
    return data;
  }

  async getListById(id: number) {
    const { data, error } = await supabase
      .from('lists_view')
      .select('id, nombre_lista, nombre_usuario, enlace_imagen, contenido_id,tipo')
      .eq('id', id);

    if (error) throw new BadRequestException('Error fetching list: ' + error.message);
    return data;
  }

  async addToList({  tipo, nombre_lista }: AddToList, id_contenido: number,id_usuario: string  ) {
    const { error } = await supabase.rpc('add_to_list', {
      p_id_usuario:   id_usuario,
      p_id_contenido: id_contenido,
      p_tipo:         tipo,
      p_nombre_lista: nombre_lista
    })

    if (error) throw new BadRequestException(error.message)
}
// service
async removeFromList({ tipo, nombre_lista }: RemoveFromList, id_contenido: number,id_usuario:string ) {
  const { error } = await supabase.rpc('remove_from_list', {
    p_id_usuario:   id_usuario,
    p_id_contenido: id_contenido,
    p_tipo:         tipo,
    p_nombre_lista: nombre_lista
  })

  if (error) throw new BadRequestException(error.message)
}
}