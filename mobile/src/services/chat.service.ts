import api from "./api";
import {SendMessageSchema, GetChatMessagesSchema} from "@shared/message.schema";
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_LOCAL_API_URL;

let socket: Socket | null = null;

export const sendMessage = async (sendMessageSchema: SendMessageSchema, chat_id: string, token: string) => {
  await api.post(`/chat/${chat_id}/message`, { user_id:sendMessageSchema.user_id, text:sendMessageSchema.text }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const getMessages = async (token: string, param: GetChatMessagesSchema) => {

  const response = await api.get(`/chat/${param.chat_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: { skip: param.skip, limit: param.limit }
  });
  return response.data;
};

export const connectSocket = (token: string) => {
  if (socket?.connected) return socket;

  socket = io(API_URL!, {
    transports: ['websocket'],
    auth: { token },
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const getSocket = () => socket;