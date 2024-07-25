import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from 'src/entities/users/user.entity';

export class SignUpDto extends PickType(User, ['email', 'password', 'nickname']) {
  /**
   * 비밀번호 확인
   * @example "Test1234!"
   */
  @IsString()
  @IsNotEmpty({ message: '비밀번호 확인을 입력해 주세요.' })
  passwordCheck: string;
}
