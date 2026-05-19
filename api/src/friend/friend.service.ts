import {  BadRequestException, Injectable } from "@nestjs/common";
import { createUserClient, supabase, supabaseAdmin } from "src/config/db";

@Injectable()
export class FriendService {

    async getAllFriends(token: string) {
        const supabase = createUserClient(token);

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('friends_view')
            .select("id, sender_id, sender_name, sender_profile_pic, receiver_id, receiver_name, receiver_profile_pic,chat_id")
            .eq('request_accepted', true);

        if (error) {
            throw new BadRequestException(`Loading friends failed: ${error.message}`);
        }

        if (data?.length === 0) return { message: "No tienes amigos" };

        // pick the friend's info (the one that is NOT the current user)
        return data.map(friendship => ({
            id: friendship.id,
            friend_id: friendship.sender_id === user?.id
                ? friendship.receiver_id
                : friendship.sender_id,
            friend_name: friendship.sender_id === user?.id 
                ? friendship.receiver_name
                : friendship.sender_name,
            friend_profile_pic: friendship.sender_id === user?.id
                ? friendship.receiver_profile_pic
                : friendship.sender_profile_pic,
            chat_id: friendship.chat_id
            }));
    }

    async getAllFriendsRequests(token: string) {
        const supabase = createUserClient(token);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id as string
        let { data, error } = await supabase
        .from('friends_view')
        .select(`
            id,
            sender_id,
            sender_name,
            sender_profile_pic
            `)
        .eq('request_accepted', false)
        .eq('receiver_id', userId); //only show requests received, not the ones i sent
        // RLS already filters by user

        if (error) {
        throw new BadRequestException(`Loading friends requests failed: ${error.message}`);
        } else if (data?.length === 0) {return {"message": "No tienes solicitudes de amistad pendientes"};}
        else return data;
    }

    async acceptFriendRequest(token: string, requestId: number) {
        const supabase = createUserClient(token);
        const { data, error } = await supabase
            .rpc('accept_friend_request', { request_id: requestId });

        if (error) {
        throw new BadRequestException(`Accepting friend request failed: ${error.message}`);
        } else if (data?.length === 0) {
        throw new BadRequestException(`Not authorized to accept this friend request or request does not exist`);
        } else if (data == 0) {
            throw new BadRequestException(`Friend request not found`);
        }else return  {"message": "Solicitud de amistad aceptada ", "id_new_chat": data};
    }

    async denyFriendRequest(token: string, requestId: number) {
        const supabase = createUserClient(token);
        let { data, error } = await supabase
            .from('amigo')
            .delete()
            .eq('id', requestId)
            .select()

        if (error) {
        throw new BadRequestException(`Denying friend request failed: ${error.message}`);
        } else if (data?.length === 0) {
        throw new BadRequestException(`Not authorized to deny this friend request or request does not exist`);
        } else return {"message": "Solicitud de amistad denegada exitosamente"};

    }

    async removeFriendship(token: string, otherUserId: string) {

    // Usamos el cliente del usuario solo para identificarlo
    const supabaseUser = createUserClient(token);
    const { data: { user } } = await supabaseUser.auth.getUser();
    const myUserId = user?.id;

    if (!myUserId) {
        throw new BadRequestException('User not authenticated');
    }

    // Buscar la amistad con supabaseAdmin para evitar problemas de RLS
    const { data: friendship, error: findError } = await supabaseAdmin
        .from('amigo')
        .select('*')
        .or(
        `and(id_usuario1.eq.${myUserId},id_usuario2.eq.${otherUserId}),and(id_usuario1.eq.${otherUserId},id_usuario2.eq.${myUserId})`
        )
        .maybeSingle();

    if (findError) throw new BadRequestException(findError.message);
    if (!friendship) throw new BadRequestException('Relationship not found');

    // Buscar conversación asociada
    const { data: conversation } = await supabaseAdmin
        .from('conversacion')
        .select('id')
        .eq('id_amigo', friendship.id)
        .maybeSingle();

    if (conversation) {

        // 1. Borrar mensajes primero
        const { error: messagesError } = await supabaseAdmin
        .from('mensaje')
        .delete()
        .eq('id_conversacion', conversation.id);

        if (messagesError) throw new BadRequestException(messagesError.message);

        // 2. Borrar conversación
        const { error: conversationError } = await supabaseAdmin
        .from('conversacion')
        .delete()
        .eq('id', conversation.id);

        if (conversationError) throw new BadRequestException(conversationError.message);
    }

    // 3. Finalmente borrar amistad
    const { error: friendshipError } = await supabaseAdmin
        .from('amigo')
        .delete()
        .eq('id', friendship.id);

    if (friendshipError) throw new BadRequestException(friendshipError.message);

    return {
        message: friendship.solicitud_aceptada
        ? 'Friend removed'
        : 'Friend request cancelled',
    };
    }

}