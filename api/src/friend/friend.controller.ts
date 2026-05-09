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

  @Get('/request/')
  async getAllFriendsRequests(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.getAllFriendsRequests(token);
  }

  @Patch('/request/:requestId')
  async acceptFriendRequest(@Req() req, @Param('requestId') requestId: number) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.acceptFriendRequest(token, requestId);
  }

  @Delete('/request/:requestId')
  async denyFriendRequest(@Req() req, @Param('requestId') requestId: number) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.friendService.denyFriendRequest(token, requestId);
  }
}