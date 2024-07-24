import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { MESSAGES } from 'src/commons/constants/trades/messages';
import { CreateTradeDto } from './create.trade.dto';
export declare class UpdateTradeDto extends PickType(CreateTradeDto, ['price']) {}
