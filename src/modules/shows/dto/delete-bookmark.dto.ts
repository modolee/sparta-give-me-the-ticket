import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class DeleteBookmarkDto {
  @Type(() => Number)
  @IsNumber()
  showId: number;

  @Type(() => Number)
  @IsNumber()
  bookmarkId: number;
}
