import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty({ message: '공연명을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '공연 설명을 입력해주세요.' })
  content: string;

  @IsNotEmpty({ message: '공연 카테고리를 입력해주세요.' })
  category: ShowCategory;

  @IsString()
  @IsNotEmpty({ message: '공연 소요시간을 입력해주세요.' })
  runtime: string;

  @IsString()
  @IsNotEmpty({ message: '공연 장소를 입력해주세요.' })
  location: string;

  @IsNumber()
  @IsNotEmpty({ message: '공연 금액을 입력해주세요.' })
  price: number;

  @IsArray()
  @IsNotEmpty({ message: '공연 이미지를 입력해주세요.' })
  imageUrl: Text[];

  @IsNumber()
  @IsNotEmpty({ message: '공연 총 좌석 수를 입력해주세요.' })
  totalSeats: number;
}
