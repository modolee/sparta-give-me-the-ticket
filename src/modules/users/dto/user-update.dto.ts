import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { USER_CONSTANT } from 'src/commons/constants/users/user.constant';

export class UserUpdateDto {
  /**
   * 이메일
   * @example 'modify@sample.com'
   */
  @IsEmail()
  @IsOptional()
  @IsNotEmpty({
    message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.EMAIL.EMPTY,
  })
  email: string;

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
   * 변경된 비밀번호
   * @example 'Aaaa!222'
   */
  @IsString()
  @IsStrongPassword(
    {
      minLength: USER_CONSTANT.COMMON.PASSWORD.MIN_LENGTH,
      minSymbols: USER_CONSTANT.COMMON.PASSWORD.MIN_SYMBOLS,
    },
    {
      message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.WEAK,
    }
  )
  @IsNotEmpty({
    message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.CHANGE,
  })
  changedPassword: string;

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
