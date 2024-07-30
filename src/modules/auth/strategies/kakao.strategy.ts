import { ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy } from 'passport-kakao';
import { User } from 'src/entities/users/user.entity';
import { Repository } from 'typeorm';

// KAKAO_CALLBACK_URL를 통해서 웹브라우저에서 로그인 진행
// 반환되는 토큰 값을 가지고 다른 기능들 사용

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User) private readonly usersRepository: Repository<User>
  ) {
    super({
      clientID: configService.get('KAKAO_CLIENT_ID'),
      clientSecret: configService.get('KAKAO_CLIENT_SECRET'),
      callbackURL: configService.get('KAKAO_CALLBACK_URL'),
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const email = profile._json.kakao_account.email;
    const nickname = new Date().getTime().toString(36); // 랜덤 닉네임 생성

    // 기존에 가입한 사용자인지 확인
    let user = await this.usersRepository.findOne({ where: { email } });
    // 없는 사용자면 데이터베이스에 사용자 정보 추가
    if (!user) {
      user = await this.usersRepository.save({
        email,
        // 빈 문자열로 설정해도 이메일로 빈 이메일로 일반 로그인 할 수 없음
        // PassportStrategy에서 비밀번호로 빈 문자열을 받지 못하게 되어 있어서
        password: '',
        nickname,
      });
    }

    return user;
  }
}
