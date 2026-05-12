import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { MovieModule } from 'src/movie/movie.module';
import { ShowModule } from 'src/show/show.module';
import { CatalogModule } from 'src/catalog/catalog.module';
import { FriendModule } from 'src/friend/friend.module';
import { ChatModule } from 'src/chat/chat.module';
import {DiaryModule} from 'src/diary/diary.module';
import { ReviewModule } from 'src/review/review.module';
import { ListModule } from '../list/list.module';

@Module({
  imports: [AuthModule, UserModule, MovieModule,ShowModule, CatalogModule, FriendModule, ChatModule, DiaryModule, ReviewModule,ListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}