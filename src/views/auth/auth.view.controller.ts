import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/auth')
export class AuthViewsController {
  @Get('/sign')
  @Render('auth/sign.view.ejs')
  signIn() {}
}
