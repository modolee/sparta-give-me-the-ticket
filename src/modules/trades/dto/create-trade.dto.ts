import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

import { MESSAGES } from 'src/commons/constants/trades/messages';

export declare class CreateTradeDto {
  @IsNumber()
  @IsNotEmpty({ message: MESSAGES.TRADE.NOT_INPUT.TICKETID })
  ticketId: number;

  @IsNumber()
  @IsNotEmpty({ message: MESSAGES.TRADE.NOT_INPUT.PRICE })
  price: number;
}
