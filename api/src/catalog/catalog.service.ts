import { BadRequestException, Injectable } from "@nestjs/common";
import { supabase } from "src/config/db";
import { ReadCatalogParam, readCatalogParam } from "../../../shared/catalog.schema";

@Injectable()
export class CatalogService {
    async getAllContent(param: ReadCatalogParam) {

        const parsedParam = readCatalogParam.parse(param);

        let query = supabase
            .from('movies_and_shows_view')
            .select('id:id, title:title, image_link:link, type_catalog:type_catalog') 

        if (parsedParam.skip !== undefined && parsedParam.limit !== undefined) query = query.range(parsedParam.skip, parsedParam.skip + parsedParam.limit - 1)    
        if (parsedParam.title) query = query.ilike('title', `%${parsedParam.title}%`)


        const { data: pelicula, error } = await query
        if (error) throw new BadRequestException(error.message)
        return { data: pelicula }
    }
}


  