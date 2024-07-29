import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';
import { MESSAGES } from 'src/commons/constants/trades/messages';

export declare class TestDto {
  @IsNumber()
  @IsNotEmpty()
  strong: number;
}
