import { Controller, Get, Render } from '@nestjs/common';

@Controller('views/shows')
export class ShowsViewsController {
  //티켓 예매 페이지
  @Get('/ticket')
  @Render('shows/shows-ticket.view.ejs')
  createTicket() {}

  //티켓 상세조회 페이지
  @Get('/detail')
  @Render('shows/shows-detail.view.ejs')
  showsDetail() {}
}
