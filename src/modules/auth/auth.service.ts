import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  // 회원가입
  async signUp(signUpDto: SignUpDto) {
    const { email, password, passwordCheck, nickname } = signUpDto;

    // 비밀번호와 비밀번호 확인 일치 체크
    if (password !== passwordCheck) {
      throw new BadRequestException('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
    }

    // 이메일 중복 체크
    let existedUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existedUser) {
      throw new ConflictException('중복된 이메일입니다.');
    }

    // 닉네임 중복 체크
    existedUser = await this.usersRepository.findOne({
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

  // 사용자 유효성 검사
  async validateUser({ email, password }) {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('일치하는 사용자가 없습니다.');
    }

    // 암호화된 비밀번호 검사
    const isComparePassword = await compare(password, user.password);
    if (!isComparePassword) {
      throw new UnauthorizedException('인증된 사용자가 아닙니다.');
    }

    return user;
  }

  // 로그인
  async signIn(user: User) {
    // 토큰 발급
    const accessToken = this.jwtService.sign({ id: user.id });
    const refreshToken = this.jwtService.sign(
      { id: user.id },
      { secret: process.env.REFRESH_SECRET_KEY, expiresIn: '7d' }
    );

    // 리프레시 토큰 저장
    // await this.usersRepository.update({ id: user.id }, { refreshToken });

    return { accessToken, refreshToken };
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
