import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/users')
export class UsersViewsController {
  // 사용자 프로필 (내 정보) 조회 페이지
  @Get('/me')
  @Render('users/me.view.ejs')
  getUserProfile() {}
}
