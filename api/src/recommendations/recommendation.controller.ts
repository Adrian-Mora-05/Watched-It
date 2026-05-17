import { BadRequestException, Body, Controller, Get, Post, Headers } from "@nestjs/common";
import { RecommendationService } from "./recommendation.service";
import { recommendationsParam} from "../../../shared/recommendation.schema";
import { supabase } from "src/config/db";
import { createZodDto } from 'nestjs-zod'

class ReadRecommendationsService extends createZodDto(recommendationsParam) {} 

@Controller('recommendations/movies')
export class RecommendationsMoviesController {
    constructor(private readonly recommendationsService: RecommendationService) {}

    @Post('generate')
    async generate(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.generateAllRecommendations(user.id, 'pelicula');
    }

    @Get('for-you')
    async getParaTi(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.getByType(user.id, 'para_ti', 'pelicula');
    }

    @Get('hidden-gems')
    async getHiddenGems(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.getByType(user.id, 'joya_oculta', 'pelicula');
    }

    @Get('world-cinema')
    async getWorldCinema(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.getByType(user.id, 'cine_mundial', 'pelicula');
    }
}

@Controller('recommendations/shows')
export class RecommendationsSeriesController {
    constructor(private readonly recommendationsService: RecommendationService) {}

    @Post('generate')
    async generate(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.generateAllRecommendations(user.id, 'serie');
    }

    @Get('for-you')
    async getParaTi(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.getByType(user.id, 'para_ti', 'serie');
    }

    @Get('hidden-gems')
    async getHiddenGems(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.getByType(user.id, 'joya_oculta', 'serie');
    }

    @Get('world-cinema')
    async getWorldCinema(@Headers('authorization') auth: string) {
        const { data: { user }, error } = await supabase.auth.getUser(auth.replace('Bearer ', ''));
        if (!user || error) throw new BadRequestException('No autorizado');
        return this.recommendationsService.getByType(user.id, 'cine_mundial', 'serie');
    }
}