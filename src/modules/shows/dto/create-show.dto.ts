import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.TITLE.REQUIRED })
  title: string;

  @IsString()
  @IsNotEmpty({ message: SHOW_MESSAGES.COMMON.CONTENT.REQUIRED })
  content: string;

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
}
