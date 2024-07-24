import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowsService } from 'src/modules/shows/shows.service';
import { ShowCategory } from 'src/commons/types/shows/show-category.type';
import { User } from 'src/entities/users/user.entity';

@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  /**
   *  공연 생성
   * @Param
   * @returns
   * */
  @Post()
  async createShow(@Body() createShowDto: CreateShowDto) {
    return await this.showsService.createShow(createShowDto);
  }

  /**
   *  공연 목록 조회
   * */
  @Get()
  getShowList(@Query('category') category: string, @Query('search') title: string) {
    return this.showsService.getShowList(category, title);
  }

  /**
   * 공연 상세 조회
   * */
  @Get(':showId')
  getShow(@Param('showId') showId: number) {
    return this.showsService.getShow(+showId);
  }

  /**
   * 공연 수정
   * */
  @Patch(':showId')
  updateShow(@Param('showId') showId: number) {
    return this.showsService.updateShow(+showId);
  }

  /**
   * 공연 삭제
   * */
  @Delete(':showId')
  deleteShow(@Param('showId') showId: number) {
    return this.showsService.deleteShow(+showId);
  }

  /**
   * 공연 찜하기 생성
   * @param showId
   * @returns
   */
  @Post(':showId/bookmark')
  async createBookmark(@Param('showId') showId: number, user: User) {
    return this.showsService.createBookmark(showId, user);
  }

  /**
   * 공연 찜하기 취소
   * @param showId
   * @returns
   */
  @Delete(':showId/bookmark')
  async deleteBookmark(@Param('showId') showId: number) {
    return this.showsService.deleteBookmark(showId);
  }
  /**
   * 티켓 예매
   * @param showId
   * @returns
   */
  @Post(':showId/ticket')
  async createTicket(@Param('showId') showId: number) {
    return this.showsService.createTicket(showId);
  }
  /**
   * 티켓 환불
   * @param showId
   * @param ticketId
   * @returns
   */
  @Delete(':showId/ticket/:ticketId')
  async refundTicket(@Param('showId') showId: number, @Param('ticketId') ticketId: number) {
    return this.showsService.refundTicket(showId, ticketId);
  }
}
