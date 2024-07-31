import { PartialType, PickType } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
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
  @IsOptional()
  @IsArray()
  imageUrl?: string[];
}
