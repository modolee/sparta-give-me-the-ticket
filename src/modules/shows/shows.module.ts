import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from './search/search.module';
import { Show } from 'src/entities/shows/show.entity';
import { User } from 'src/entities/users/user.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Image } from 'src/entities/images/image.entity';
import { ConfigModule } from '@nestjs/config';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { ImagesService } from '../images/images.service';
import { BullModule } from '@nestjs/bullmq';
import { ShowsConsumer } from './shows.consumer';
import { QUEUES } from 'src/commons/constants/queue.constant';
import { TicketQueueEvents } from 'src/queue-events/ticket.queue-event';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.registerQueue({
      name: QUEUES.TICKET_QUEUE,
    }),
    TypeOrmModule.forFeature([Show, User, Ticket, Bookmark, Schedule, Image]),
    SearchModule,
  ],
  controllers: [ShowsController],

  providers: [ShowsService, ShowsConsumer, TicketQueueEvents, ImagesService],
  exports: [TypeOrmModule],
})
export class ShowsModule {}
