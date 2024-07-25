import { PickType } from '@nestjs/swagger';
import { IsDateString, IsMilitaryTime, IsNotEmpty } from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { Schedule } from 'src/entities/shows/schedule.entity';

export class CreateScheduleDto extends PickType(Schedule, ['date', 'time']) {
  @IsDateString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.DATE.REQUIRED })
  date: Date;

  @IsMilitaryTime()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TIME.REQUIRED })
  time: string;
}
