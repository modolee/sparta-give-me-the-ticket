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
import { CreateTicketDto } from './dto/create-ticket-dto';
import { RolesGuard } from '../auth/utils/roles.guard';
import { Roles } from '../auth/utils/roles.decorator';
import { Role } from 'src/commons/types/users/user-role.type';
import { SHOW_TICKET_MESSAGES } from 'src/commons/constants/shows/show-ticket-messages.constant';

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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
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
    return await this.showsService.getShow(showId);
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async updateShow(@Param('showId') showId: number, @Body() updateShowDto: UpdateShowDto) {
    return await this.showsService.updateShow(showId, updateShowDto);
  }

  /**
   * 공연 삭제
   * @param showId
   * @returns
   * */
  @ApiBearerAuth()
  @Delete(':showId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  async deleteShow(@Param('showId') showId: number) {
    return await this.showsService.deleteShow(showId);
  }

  /**
   * 공연 찜하기 생성
   * @param showId
   * @returns
   */
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Post(':showId/bookmark')
  @HttpCode(HttpStatus.CREATED)
  async createBookmark(@Param('showId') showId: number, @Req() req: any) {
    const bookmark = await this.showsService.createBookmark(showId, req.user);
    return {
      status: HttpStatus.CREATED,
      message: USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.SUCCESS.COMPLETED,
      bookmarkId: bookmark.id,
    };
  }

  /**
   * 공연 찜하기 취소
   * @param showId
   * @returns
   */
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
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
   * @param createTicketDto
   * @returns
   */
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Post(':showId/ticket')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'))
  async createTicket(
    @Param('showId') showId: number,
    @Body() createTicketDto: CreateTicketDto,
    @Req() req: any
  ) {
    const ticket = await this.showsService.addTicketQueue(showId, createTicketDto, req.user);
    return {
      status: HttpStatus.OK,
      message: SHOW_TICKET_MESSAGES.COMMON.TICKET.SUCCESS,
      ticket,
    };
  }
  /**
   * 티켓 환불
   * @param showId
   * @param ticketId
   * @returns
   */
  @ApiBearerAuth()
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @Delete(':showId/ticket/:ticketId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async refundTicket(
    @Param('showId') showId: number,
    @Param('ticketId') ticketId: number,
    @Req() req: any
  ) {
    await this.showsService.refundTicket(showId, ticketId, req.user);
    return {
      status: HttpStatus.OK,
      message: SHOW_TICKET_MESSAGES.COMMON.REFUND.SUCCESS,
    };
  }
}
