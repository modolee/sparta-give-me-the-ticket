import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';

export class ChargePointDto {
  /**
   * 포인트
   * @example 10000
   */
  @IsNumber()
  @IsPositive({
    message: USER_MESSAGES.USER.POINT.CHARGE.FAILURE.POSITIVE,
  })
  @IsNotEmpty({
    message: USER_MESSAGES.USER.POINT.CHARGE.FAILURE.EMPTY,
  })
  amount: number;
}
