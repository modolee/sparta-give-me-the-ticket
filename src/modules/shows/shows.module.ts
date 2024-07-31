import { Module } from '@nestjs/common';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { User } from 'src/entities/users/user.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { ConfigModule } from '@nestjs/config';


import { QueueConsumer } from './shows.consumer';
import { BullModule } from '@nestjs/bullmq';
import { TICKET_QUEUE } from 'src/commons/constants/queue.constant';
import { TicketQueueEvents } from 'src/queue-events/ticket.queue-event';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.registerQueue({
      name: TICKET_QUEUE,
    }),
    TypeOrmModule.forFeature([Show, User, Ticket, Bookmark, Schedule, Image]),
  ],
  controllers: [ShowsController],

  providers: [ShowsService, QueueConsumer, TicketQueueEvents, ImagesService],
  exports: [TypeOrmModule],
})
export class ShowsModule {}
