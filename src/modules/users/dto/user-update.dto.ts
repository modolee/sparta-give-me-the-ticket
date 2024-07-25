import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/entities/users/user.entity';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';

export class UserUpdateDto extends PickType(User, ['nickname', 'profileImg']) {
  /**
   * 현재 비밀번호
   * @example "Test1234!"
   */
  @IsString()
  @IsNotEmpty({
    message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.NOW,
  })
  currentPassword: string;
}
