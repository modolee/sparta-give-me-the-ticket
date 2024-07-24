import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

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
   * @param SignInDto
   * @returns
   */
  @Post('/sign-in')
  async signIn(@Body() SignInDto: SignInDto) {
    return await this.authService.signIn(SignInDto);
  }

  /**
   * 로그아웃
   * @param req
   * @returns
   */
  @Post('/sign-out')
  async signOut(@Req() req: any) {
    return await this.authService.signOut(req.user.id);
  }

  /**
   * 토큰 재발급
   * @param req
   * @returns
   */
  @Post('/reissue')
  async reissue(@Req() req: any) {
    return await this.authService.reissue(req.user.id);
  }
}
