import { UseGuards, Controller, Post,Body, Req, Get, Query,Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ChatService } from './chat.service';
import {sendMessageSchema, getChatMessagesSchema} from '../../../shared/message.schema';
import { createZodDto } from 'node_modules/nestjs-zod/dist/index.mjs';

class sendMessageDto extends createZodDto(sendMessageSchema) {} 

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) {}

    @Post('/message') 
    async sendMessage(@Req() req, @Body() body: sendMessageDto) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        return this.chatService.sendMessage(token, body);
    }

    @Get('/:id')
    async getChat( @Req() req, @Param('id') id: string, @Query('skip') skip: string = '0', @Query('limit') limit: string = '15') {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const parsedParam = getChatMessagesSchema.parse({
        chat_id: Number(id),
        skip: Number(skip),
        limit: Number(limit)
    });
    return this.chatService.getChat(token, parsedParam);
    }
}