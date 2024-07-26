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
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { ShowsService } from 'src/modules/shows/shows.service';
import { User } from 'src/entities/users/user.entity';
import { USER_BOOKMARK_MESSAGES } from 'src/commons/constants/users/user-bookmark-messages.constant';
import { AuthGuard } from '@nestjs/passport';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateShowDto } from './dto/update-show.dto';
import { GetShowListDto } from './dto/get-show-list.dto';

@ApiTags('공연')
@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}

  /**
   *  공연 생성
   * @Param createShowDto
   * @param req
   * @returns
   * */
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createShow(@Body() createShowDto: CreateShowDto, @Req() req: any) {
    return await this.showsService.createShow(createShowDto, req);
  }

  /**
   *  공연 목록 조회
   * @returns
   * */
  @Get()
  async getShowList(@Query() getShowListDto: GetShowListDto) {
    return await this.showsService.getShowList(getShowListDto);
  }

  /**
   * 공연 상세 조회
   * @param showId
   * @returns
   * */
  @Get(':showId')
  async getShow(@Param('showId') showId: number) {
    return await this.showsService.getShow(+showId);
  }

  /**
   * 공연 수정
   * @param showId
   * @param updateShowDto
   * @param req
   * @returns
   * */
  @ApiBearerAuth()
  @Patch(':showId')
  @UseGuards(AuthGuard('jwt'))
  async updateShow(
    @Param('showId') showId: number,
    @Body() updateShowDto: UpdateShowDto,
    @Req() req: any
  ) {
    return await this.showsService.updateShow(+showId, updateShowDto, req);
  }

  /**
   * 공연 삭제
   * @param showId
   * @returns
   * */
  @ApiBearerAuth()
  @Delete(':showId')
  @UseGuards(AuthGuard('jwt'))
  async deleteShow(@Param('showId') showId: number, @Req() req: any) {
    return await this.showsService.deleteShow(+showId, req);
  }

  /**
   * 공연 찜하기 생성
   * @param showId
   * @returns
   */
  @Post(':showId/bookmark')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  async createBookmark(@Param('showId') showId: number, @Req() req: any) {
    const user: User = req.user;
    await this.showsService.createBookmark(showId, user);
    return {
      status: HttpStatus.CREATED,
      message: USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.SUCCESS.COMPLETED,
    };
  }

  /**
   * 공연 찜하기 취소
   * @param showId
   * @returns
   */
  @Delete(':showId/bookmark/:bookmarkId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async deleteBookmark(@Param() deleteBookmarkDto: DeleteBookmarkDto) {
    await this.showsService.deleteBookmark(deleteBookmarkDto);
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
  async createTicket(@Param('showId') showId: number, scheduleId: number, @Req() req: any) {
    const user: User = req.user;
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
    user: User
  ) {
    await this.showsService.refundTicket(showId, ticketId, schedule, user);
    return { status: HttpStatus.OK };
  }
}
