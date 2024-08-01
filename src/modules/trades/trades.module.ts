import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from 'src/commons/constants/queue.constant';

//entities
import { Trade } from '../../entities/trades/trade.entity';
import { TradeLog } from '../../entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';
import { TicketProcessor } from './ticket.process';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.registerQueue({
      name: 'tradeQueue',
    }),
    TypeOrmModule.forFeature([Trade, TradeLog, Show, Schedule, Ticket, User, TradeLog]),
  ],
  controllers: [TradesController],
  providers: [TradesService, TicketProcessor],
  exports: [TypeOrmModule],
})
export class TradesModule {}
