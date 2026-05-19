import { Controller, Delete, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Get('/')
  async getAllFriends(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.getAllFriends(token);
  }

  @Get('/requests')          // cambié 'request' a 'requests' para que no colisione
  async getAllFriendsRequests(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.getAllFriendsRequests(token);
  }

  @Patch('/requests/:requestId')   // ídem
  async acceptFriendRequest(@Req() req, @Param('requestId') requestId: number) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.acceptFriendRequest(token, requestId);
  }

  @Delete('/requests/:requestId')  // ídem — ANTES de /:userId
  async denyFriendRequest(@Req() req, @Param('requestId') requestId: number) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.denyFriendRequest(token, requestId);
  }

  @Delete('/:userId')              // siempre al final
  async removeFriendship(@Req() req, @Param('userId') userId: string) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.removeFriendship(token, userId);
  }
}