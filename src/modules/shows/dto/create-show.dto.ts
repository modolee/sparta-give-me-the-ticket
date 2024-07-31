import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';
import { CreateScheduleDto } from './create-schedule.dto';
import { Type } from 'class-transformer';
import { MIN_SHOW_CONTENT_LENGTH } from 'src/commons/constants/shows/shows.constant';
import { Show } from 'src/entities/shows/show.entity';
import { IntersectionType, PickType } from '@nestjs/swagger';

export class CreateShowDto extends PickType(Show, [
  'title',
  'content',
  'category',
  'runtime',
  'location',
  'price',
  'totalSeat',
]) {
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TITLE.REQUIRED })
  title: string;

  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.CONTENT.REQUIRED })
  @MinLength(MIN_SHOW_CONTENT_LENGTH, { message: SHOW_MESSAGES.COMMON.CONTENT.MIN_LENGTH })
  content: string;

  @IsEnum(ShowCategory, { message: SHOW_MESSAGES.COMMON.CATEGORY.INVALID })
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.CATEGORY.REQUIRED })
  category: ShowCategory;

  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.RUNTIME.REQUIRED })
  runtime: number;

  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.LOCATION.REQUIRED })
  location: string;

  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.PRICE.REQUIRED })
  price: number;

  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TOTAL_SEAT.REQUIRED })
  totalSeat: number;

  @IsArray()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.IMAGE.REQUIRED })
  imageUrl: string[];

  @IsArray()
  @ValidateNested()
  @Type(() => CreateScheduleDto)
  schedules: CreateScheduleDto[];
}
