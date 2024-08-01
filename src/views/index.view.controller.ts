import { Controller, Get, Render } from '@nestjs/common';

@Controller('views')
export class ViewsController {
  @Get()
  @Render('index.view.ejs')
  moveToHome() {}
}
