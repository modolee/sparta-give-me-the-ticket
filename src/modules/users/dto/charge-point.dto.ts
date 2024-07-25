import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';

export class ChargePointDto {
  @IsNumber()
  @IsPositive({
    message: USER_MESSAGES.USER.POINT_CHARGE.FAILURE.POSITIVE,
  })
  @IsNotEmpty({
    message: USER_MESSAGES.USER.POINT_CHARGE.FAILURE.EMPTY,
  })
  amount: number;
}
