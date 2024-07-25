import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';

export class UserUpdateDto {
  /**
   * 닉네임
   * @example 'Charlie'
   */
  @IsString()
  @IsOptional()
  @IsNotEmpty({
    message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.NICKNAME.EMPTY,
  })
  nickname: string;

  /**
   * 현재 비밀번호
   * @example 'Aaaa!111'
   */
  @IsString()
  @IsNotEmpty({
    message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.NOW,
  })
  currentPassword: string;

  /**
   * 프로필 이미지
   * @example ''
   */
  @IsString()
  @IsNotEmpty({
    message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PROFILEIMG.EMPTY,
  })
  profileImg: string;
}
