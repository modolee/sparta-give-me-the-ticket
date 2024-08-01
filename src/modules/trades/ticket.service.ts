import {
  Injectable,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { addHours, startOfDay, subDays, subHours } from 'date-fns';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Inject } from '@nestjs/common';
import { SERVER } from '../../commons/constants/server.constants';
import { MESSAGES } from 'src/commons/constants/trades/messages';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

//types
import { Role } from 'src/commons/types/users/user-role.type';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { number } from 'joi';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';

//DataSource File
import { DataSource, Like } from 'typeorm';

@Injectable()
export class TicketService {
  constructor() {}
}
