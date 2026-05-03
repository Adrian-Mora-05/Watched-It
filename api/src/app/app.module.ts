import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MovieModule } from 'src/movie/movie.module';
import { ShowModule } from 'src/show/show.module';
import { CatalogModule } from 'src/catalog/catalog.module';

@Module({
  imports: [AuthModule, UserModule, MovieModule,ShowModule, CatalogModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}