import { PartialType } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { CreateShowDto } from './create-show.dto';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';

export class UpdateShowDto extends PartialType(CreateShowDto) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  category?: ShowCategory;

  @IsOptional()
  @IsString()
  runtime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  imageUrl?: Text[];

  @IsOptional()
  @IsNumber()
  totalSeats?: number;
}
