import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateTicketDto {
  @Type(() => Number)
  @IsNumber()
  scheduleId: number;
}
