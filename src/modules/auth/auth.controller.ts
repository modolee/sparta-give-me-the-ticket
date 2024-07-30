import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KakaoAuthGuard } from './utils/kakao.guard';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   * @param signUpDto
   * @returns
   */
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  /**
   * 로그인
   * @param signInDto
   * @returns
   */
  @UseGuards(AuthGuard('local'))
  @Post('/sign-in')
  async signIn(@Req() req: any, @Body() signInDto: SignInDto) {
    return await this.authService.signIn(req.user);
  }

  /**
   * 카카오 로그인
   * @param req
   * @returns
   */
  @UseGuards(KakaoAuthGuard)
  @Get('/kakao')
  async kakaoSignIn(@Req() req: any, @Res() res: any) {
    console.log('controller : ', req.user);
    const { accessToken, refreshToken } = await this.authService.signIn(req.user);
    return res.send({ accessToken, refreshToken });
  }

  /**
   * 로그아웃
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('refreshToken'))
  @Post('/sign-out')
  async signOut(@Req() req: any) {
    return await this.authService.signOut(req.user.id);
  }

  /**
   * 토큰 재발급
   * @param req
   * @returns
   */
  @ApiBearerAuth()
  @UseGuards(AuthGuard('refreshToken'))
  @Post('/reissue')
  async reissue(@Req() req: any) {
    return await this.authService.reissue(req.user);
  }
}
