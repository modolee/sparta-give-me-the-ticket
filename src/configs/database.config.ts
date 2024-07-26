import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Show } from '../entities/shows/show.entity';
import { User } from '../entities/users/user.entity';
import { PointLog } from '../entities/users/point-log.entity';
import { Bookmark } from '../entities/users/bookmark.entity';
import { Ticket } from '../entities/shows/ticket.entity';
import { Trade } from '../entities/trades/trade.entity';
import { TradeLog } from '../entities/trades/trade-log.entity';
import { Schedule } from '../entities/shows/schedule.entity';
import { Image } from '../entities/images/image.entity';

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (ConfigService: ConfigService): {} => ({
    type: 'mysql',
    host: ConfigService.get('DB_HOST'),
    port: ConfigService.get('DB_PORT'),
    username: ConfigService.get('DB_USER'),
    password: ConfigService.get('DB_PASSWORD'),
    database: ConfigService.get('DB_NAME'),
    // entities: ['dist/**/*.entity.js'],
    entities: [Show, User, PointLog, Bookmark, Ticket, Trade, TradeLog, Schedule, Image],
    synchronize: ConfigService.get('DB_SYNC'),
    namingStrategy: new SnakeNamingStrategy(),
    //logging: true,
  }),
};
