import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { MESSAGES } from 'src/commons/constants/trades/messages';
import { CreateTradeDto } from './create-trade.dto';
export declare class UpdateTradeDto extends PickType(CreateTradeDto, ['price']) {
  @IsNumber()
  @IsNotEmpty({ message: '중고거래 ID를 입력해주세요' })
  tradeId: number;
}
