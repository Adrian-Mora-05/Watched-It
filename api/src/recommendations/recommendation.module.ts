import { Module } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import { RecommendationsMoviesController, RecommendationsSeriesController} from './recommendation.controller';

@Module({
  controllers: [RecommendationsMoviesController, RecommendationsSeriesController],
  providers: [RecommendationService],
})
export class RecommendationModule {}