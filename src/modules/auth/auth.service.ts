import { Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor() {}

  // 회원가입
  async signUp(signUpDto: SignUpDto) {
    return;
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
