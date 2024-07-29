import { PartialType, PickType } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';
import { Show } from 'src/entities/shows/show.entity';
import { Type } from 'class-transformer';
import { CreateScheduleDto } from './create-schedule.dto';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';

// Show 엔티티에서 필요한 컬럼 선택
class ShowDto extends PickType(Show, [
  'title',
  'content',
  'category',
  'runtime',
  'location',
  'price',
] as const) {}
export class UpdateShowDto extends PartialType(ShowDto) {
  @IsString()
  title?: string;

  @IsString()
  content?: string;

  @IsEnum(ShowCategory, { message: SHOW_MESSAGES.COMMON.CATEGORY.INVALID })
  category?: ShowCategory;

  @IsNumber()
  runtime?: number;

  @IsString()
  location?: string;

  @IsNumber()
  price?: number;

  @ValidateNested()
  @Type(() => CreateScheduleDto)
  schedules?: CreateScheduleDto[];
}
