import { MovieController } from "./movie.controller";
import { MovieService } from "./movie.service";
import { Module } from '@nestjs/common';

@Module({
  controllers: [MovieController],
  providers: [MovieService],
})
export class MovieModule {}
