import { Controller, Delete, Get, Patch, Req, UseGuards } from '@nestjs/common';
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
    const { userId } = req.body;
    return this.friendService.getAllFriendsRequests(token, userId);
  }

  @Patch('/request/')
  async acceptFriendRequest(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { requestId } = req.body;
    return this.friendService.acceptFriendRequest(token, requestId);
  }

  @Delete('/request/')
  async denyFriendRequest(@Req() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { requestId } = req.body;
    return this.friendService.denyFriendRequest(token, requestId);
  }
}