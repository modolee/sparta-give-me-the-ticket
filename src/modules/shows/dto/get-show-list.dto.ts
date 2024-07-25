import { IsEnum, IsOptional, IsString } from 'class-validator';
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
  @IsString()
  search?: string;
}
