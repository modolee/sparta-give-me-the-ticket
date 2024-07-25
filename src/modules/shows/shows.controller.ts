import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowsService } from 'src/modules/shows/shows.service';
import { User } from 'src/entities/users/user.entity';
import { USER_BOOKMARK_MESSAGES } from 'src/commons/constants/users/user-bookmark-messages.constant';
import { AuthGuard } from '@nestjs/passport';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Show } from 'src/entities/shows/show.entity';
import { ApiTags } from '@nestjs/swagger';
import { UpdateShowDto } from './dto/update-show.dto';
import { GetShowListDto } from './dto/get-show-list.dto';

@ApiTags('공연')
@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  /**
   *  공연 생성
   * @Param createShowDto
   * @returns
   * */
  @Post()
  @UseGuards(AuthGuard('local'))
  async createShow(@Body() createShowDto: CreateShowDto, userId: number) {
    return await this.showsService.createShow(createShowDto, userId);
  }

  /**
   *  공연 목록 조회
   * @returns
   * */
  @Get()
  getShowList(@Query() getShowListDto: GetShowListDto) {
    return this.showsService.getShowList(getShowListDto);
  }

  /**
   * 공연 상세 조회
   * @param showId
   * @returns
   * */
  @Get(':showId')
  getShow(@Param('showId') showId: number) {
    return this.showsService.getShow(+showId);
  }

  /**
   * 공연 수정
   * @param showId
   * @returns
   * */
  @Patch(':showId')
  updateShow(@Param('showId') showId: number, @Body() updateShowDot: UpdateShowDto) {
    return this.showsService.updateShow(+showId, updateShowDot);
  }

  /**
   * 공연 삭제
   * @param showId
   * @returns
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
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  async createBookmark(@Param('showId') showId: number, user: User) {
    await this.showsService.createBookmark(showId, user);
    return { message: USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.SUCCESS.COMPLETED };
  }

  /**
   * 공연 찜하기 취소
   * @param showId
   * @returns
   */
  @Delete(':showId/bookmark')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async deleteBookmark(@Param('showId') showId: number, @Param('bookmarkId') bookmarkId: number) {
    await this.showsService.deleteBookmark(showId, bookmarkId);
    return {
      status: HttpStatus.OK,
      message: USER_BOOKMARK_MESSAGES.COMMON.CANCEL_BOOKMARK.SUCCESS.COMPLETED,
    };
  }
  /**
   * 티켓 예매
   * @param showId
   * @returns
   */
  @Post(':showId/ticket')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  async createTicket(@Param('showId') showId: number, scheduleId: number, user: User) {
    return this.showsService.createTicket(showId, scheduleId, user);
  }
  /**
   * 티켓 환불
   * @param showId
   * @param ticketId
   * @returns
   */
  @Delete(':showId/ticket/:ticketId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async refundTicket(
    @Param('showId') showId: number,
    @Param('ticketId') ticketId: number,
    schedule: Schedule,
    user: User,
    show: Show
  ) {
    await this.showsService.refundTicket(showId, ticketId, schedule, user);
    return { status: HttpStatus.OK };
  }
}
