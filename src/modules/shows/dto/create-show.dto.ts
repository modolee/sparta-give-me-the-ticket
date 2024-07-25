import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';
import { CreateScheduleDto } from './create-schedule.dto';
import { Type } from 'class-transformer';

export class CreateShowDto {
  /**
   * 공연명
   * @example "시카고"
   */
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TITLE.REQUIRED })
  title: string;

  /**
   * 공연 설명
   * @example "브로드웨이 역사상 가장 롱런하고 있는 미국 뮤지컬"
   */
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.CONTENT.REQUIRED })
  content: string;

  /**
   * 공연 카테고리
   * @example "Musical"
   */
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.CATEGORY.REQUIRED })
  category: ShowCategory;

  /**
   * 공연 소요시간
   * @example 200
   */
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.RUNTIME.REQUIRED })
  runtime: number;

  /**
   * 공연 장소
   * @example "서울시 구로구 경인로 662, 디큐브 링크아트센터"
   */
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.LOCATION.REQUIRED })
  location: string;

  /**
   * 공연 금액
   * @example 30000
   */
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.PRICE.REQUIRED })
  price: number;

  /**
   * 공연 총 좌석 수
   * @example 1800
   */
  @IsNumber()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TOTAL_SEAT.REQUIRED })
  totalSeat: number;

  @ValidateNested()
  @Type(() => CreateScheduleDto)
  schedules: CreateScheduleDto[];
}
