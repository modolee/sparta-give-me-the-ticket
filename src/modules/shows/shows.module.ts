import { Module } from '@nestjs/common';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { User } from 'src/entities/users/user.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { SearchService } from './search/search.service';
import { SearchModule } from './search/search.module';
@Module({
  imports: [TypeOrmModule.forFeature([Show, User, Ticket, Bookmark, Schedule]), SearchModule],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [TypeOrmModule],
})
export class ShowsModule {}
