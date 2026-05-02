import { CatalogController } from "./catalog.controller";
import { CatalogService } from "./catalog.service";
import { Module } from "@nestjs/common";

@Module({
    controllers: [CatalogController],
    providers: [CatalogService]
})

export class CatalogModule {}
export class ShowModule {}