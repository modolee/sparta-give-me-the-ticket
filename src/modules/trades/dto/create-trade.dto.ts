import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

import { MESSAGES } from 'src/commons/constants/trades/messages';

export declare class CreateTradeDto {
  @IsNumber()
  @IsNotEmpty({ message: MESSAGES.TRADES.NOT_INPUT.TICKET_ID })
  ticketId: number;

  @IsNumber()
  @IsNotEmpty({ message: MESSAGES.TRADES.NOT_INPUT.PRICE })
  price: number;
}
