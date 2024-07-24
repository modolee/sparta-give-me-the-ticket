import { Module } from '@nestjs/common';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { User } from 'src/entities/users/user.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Show, User, Ticket, Bookmark])],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [TypeOrmModule],
})
export class ShowsModule {}
