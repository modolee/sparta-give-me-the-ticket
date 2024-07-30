import { Module } from '@nestjs/common';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { User } from 'src/entities/users/user.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ShowsConsumer } from './shows.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.registerQueue({
      name: 'ticketQueue',
    }),
    TypeOrmModule.forFeature([Show, User, Ticket, Bookmark, Schedule]),
  ],
  controllers: [ShowsController],
  providers: [ShowsService, ShowsConsumer],
  exports: [TypeOrmModule, BullModule],
})
export class ShowsModule {}
