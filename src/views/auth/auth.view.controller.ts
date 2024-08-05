import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/auth')
export class AuthViewsController {
  @Get('/sign')
  @Render('auth/sign.view.ejs')
  signIn() {}

  // 단순하게 카카오 로그인 API의 redirect 처리를 위한 경로
  // 일반 로그인과 진행 방식이 다르기 때문에 별로의 경로를 사용
  // process 페이지에서 토큰을 위한 JS 코드 실행
  @Get('/kakao/process')
  @Render('auth/kakao-sign-in.view.ejs')
  kakaoSignInProcess() {}
}
