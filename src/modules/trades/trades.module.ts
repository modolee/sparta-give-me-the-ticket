import { Module } from '@nestjs/common';
import { TradesService } from './trades.service';
import { TradesController } from './trades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

//entities
import { Trade } from '../../entities/trades/trade.entity';
import { TradeLog } from '../../entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'ticketQueue',
    }),
    TypeOrmModule.forFeature([Trade, TradeLog, Show, Schedule, Ticket, User]),
  ],
  controllers: [TradesController],
  providers: [TradesService],
  exports: [TypeOrmModule, BullModule],
})
export class TradesModule {}
