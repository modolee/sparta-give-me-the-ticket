import { PickType } from '@nestjs/swagger';
import { IsDateString, IsMilitaryTime, IsNotEmpty } from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { Schedule } from 'src/entities/shows/schedule.entity';

export class CreateScheduleDto extends PickType(Schedule, ['date', 'time']) {
  /**
   * 공연 날짜
   * @example "2024-07-25"
   */
  @IsDateString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.DATE.REQUIRED })
  date: Date;

  /**
   * 공연 시간
   * @example "14:30"
   */
  @IsMilitaryTime()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TIME.REQUIRED })
  time: string;
}
