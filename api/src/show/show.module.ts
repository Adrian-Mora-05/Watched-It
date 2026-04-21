import { ShowController } from "./show.controller";
import { ShowService } from "./show.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [ShowController],
    providers: [ShowService]
})
export class ShowModule {}