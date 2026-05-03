import {Controller, Get, Query} from "@nestjs/common";
import { CatalogService } from "./catalog.service";
import { readCatalogParam, ReadCatalogParam } from "../../../shared/catalog.schema";
import { createZodDto } from "node_modules/nestjs-zod/dist/index.mjs";

class ReadCatalogParamDto extends createZodDto(readCatalogParam) {} //transforms the schema into a dto

@Controller('catalog')
export class CatalogController {
    constructor(private readonly catalogService: CatalogService) {} 

    @Get('/')
    async getAllContent(@Query() param: ReadCatalogParamDto) {
        return this.catalogService.getAllContent(param);
    }
}