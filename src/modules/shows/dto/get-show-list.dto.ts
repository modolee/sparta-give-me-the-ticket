import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { MIN_SHOW_SEARCH_LENGTH } from 'src/commons/constants/shows/shows.constant';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';

export class GetShowListDto {
  /**
   * 카테고리
   * @example "Musical"
   */
  @IsOptional()
  @IsEnum(ShowCategory)
  category?: ShowCategory;

  /**
   * 검색 키워드
   * @example "시카고"
   */
  @IsOptional()
  @MinLength(MIN_SHOW_SEARCH_LENGTH, { message: SHOW_MESSAGES.GET_LIST.MIN_LENGTH })
  @IsString()
  search?: string;

  /**
   * 페이지 번호
   * @example 1
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number;

  /**
   * 페이지 당 항목 수
   * @example 10
   */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number;
}
