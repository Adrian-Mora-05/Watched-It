import { FriendService } from "./friend.service";
import { FriendController } from "./friend.controller";
import { Module } from "@nestjs/common";

@Module({
    controllers: [FriendController],
    providers: [FriendService]
})
export class FriendModule {}