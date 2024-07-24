import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  // 회원가입
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordCheck, nickname } = signUpDto;

    // 비밀번호와 비밀번호 확인 일치 체크
    if (password !== passwordCheck) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    // 이메일 중복 체크
    let existedUser = await this.usersRepository.find({
      where: { email },
    });
    if (existedUser) {
      throw new ConflictException('중복된 이메일입니다.');
    }

    // 닉네임 중복 체크
    existedUser = await this.usersRepository.find({
      where: { nickname },
    });
    if (existedUser) {
      throw new ConflictException('중복된 닉네임입니다.');
    }

    // 비밀번호 암호화
    const hashedPassword = await hash(password, 10);

    const user = await this.usersRepository.save({
      email,
      hashedPassword,
      nickname,
    });

    user.password = undefined;
    return user;
  }

  // 로그인
  async signIn(signInDto: SignInDto) {
    return;
  }

  // 로그아웃
  async signOut(userId: number) {
    return;
  }

  // 토큰 재발급
  async reissue(userId: number) {
    return;
  }
}
