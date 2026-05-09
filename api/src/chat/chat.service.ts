import { BadRequestException, Injectable } from "@nestjs/common";
import { SendMessageSchema, GetChatMessagesSchema } from '../../../shared/message.schema';
import { createUserClient } from "src/config/db";
import { ChatGateway } from "./chat.gateway";

@Injectable()
export class ChatService {
    constructor(private readonly chatGateway: ChatGateway) {}
    
    async sendMessage(token: string, chat_id: string, body: SendMessageSchema) {
        const supabase = createUserClient(token);
        const { data, error } = await supabase
            .from('mensaje')
            .insert([{
                id_usuario: body.user_id,
                id_conversacion: chat_id,
                texto: body.text
            }])
            .select()

        if (error) {
            throw new BadRequestException(`Sending message failed: ${error.message}`);
        }

        this.chatGateway.emitNewMessage(chat_id, data[0]); // 👈 only one emit
        return data;
    }
    async getChat(token: string, body: GetChatMessagesSchema) {
        const supabase = createUserClient(token);
        let { data: mensaje, error } = await supabase
            .from('mensaje')
            .select('fecha_creacion, texto, id,id_usuario')
            .range(body.skip, body.skip + body.limit-1)
            .eq('id_conversacion', body.chat_id)
            .order('fecha_creacion', { ascending: false })
        if (error) {
            throw new BadRequestException(`Fetching chat messages failed: ${error.message}`);
        } else {
            return mensaje;
        }
    }



}