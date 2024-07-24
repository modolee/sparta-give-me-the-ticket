import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(signUpDto);
  }

  @Post('/sign-in')
  async signIn(@Body() SignInDto: SignInDto) {
    return await this.authService.signIn(SignInDto);
  }

  @Post('/sign-out')
  async signOut(@Req() req: any) {
    return await this.authService.signOut(req.user.id);
  }

  @Post('/reissue')
  async reissue(@Req() req: any) {
    return await this.authService.reissue(req.user.id);
  }
}
