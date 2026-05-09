import {z} from 'zod';

export const sendMessageSchema = z.object({
    user_id: z.string(), // id from the user that sent the message
    text: z.string()
            .min(1, 'El mensaje no puede estar vacío')
});

export const getChatMessagesSchema = z.object({
    chat_id: z.number(), // id from the chat where the messages are
    skip: z.number().default(0), // number of messages to skip for pagination
    limit: z.number().default(15) // number of messages to return for pagination
});

export type SendMessageSchema = z.infer<typeof sendMessageSchema> //generates a type from the schema
export type GetChatMessagesSchema = z.infer<typeof getChatMessagesSchema> //generates a type from the schema