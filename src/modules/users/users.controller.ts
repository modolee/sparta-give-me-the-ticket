import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from '../auth/utils/roles.guard';
import { Roles } from '../auth/utils/roles.decorator';
import { Role } from 'src/commons/types/users/user-role.type';

import { UsersService } from './users.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { ChargePointDto } from './dto/charge-point.dto';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { USER_BOOKMARK_MESSAGES } from 'src/commons/constants/users/user-bookmark-messages.constant';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('사용자')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.USER)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * 포인트 내역 조회
   * @param req
   * @returns
   */
  @Get('/me/point')
  async getPointLog(@Req() req: any) {
    const getPointLog = await this.userService.getPointLog(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.POINT.GET_LOG.SUCCESS,
      getPointLog,
    };
  }

  /**
   * 예매 목록 조회
   * @param req
   * @returns
   */
  @Get('/me/ticket')
  async getTicketList(@Req() req: any) {
    const getTicketList = await this.userService.getTicketList(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.TICKET.GET_LIST.SUCCESS,
      getTicketList,
    };
  }

  /**
   * 북마크 목록 조회
   * @param req
   * @returns
   */
  @Get('/me/bookmark')
  async getBookmarkList(@Req() req: any) {
    const getBookmarkList = await this.userService.getBookmarkList(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      message: USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.GET_LIST.SUCCESS,
      getBookmarkList,
    };
  }

  /**
   * 거래 내역 조회
   * @param req
   * @returns
   */
  @Get('/me/trade')
  async getTradeLog(@Req() req: any) {
    const getTradeLog = await this.userService.getTradeLog(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.TRADE.GET_LOG.SUCCESS,
      getTradeLog,
    };
  }

  /**
   * 사용자 프로필 조회
   * @param req
   * @returns
   */
  @Get('/me')
  async getUserProfile(@Req() req: any) {
    const getUserProfile = await this.userService.getUserProfile(req.user);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.USERINFO.GET_PROFILE.SUCCESS,
      getUserProfile,
    };
  }

  /**
   * 사용자 정보 수정
   * @param req
   * @param userUpdateDto
   * @returns
   */
  @Patch('/me')
  async updateUser(@Req() req: any, @Body() userUpdateDto: UserUpdateDto) {
    const updateUser = await this.userService.updateUser(req.user.id, userUpdateDto);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.USERINFO.UPDATE.SUCCESS,
      updateUser,
    };
  }

  /**
   * 사용자 포인트 충전
   * @param req
   * @param chargePointDto
   * @returns
   */
  @Post('/me/point')
  async chargePoint(@Req() req: any, @Body() chargePointDto: ChargePointDto) {
    const updateUserPoint = await this.userService.chargePoint(req.user.id, chargePointDto);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.POINT.CHARGE.SUCCESS,
      updateUserPoint,
    };
  }

  /**
   * 회원 탈퇴
   * @param req
   * @returns
   */
  @Delete('/me')
  async deleteUser(@Req() req: any) {
    const deleteUser = await this.userService.deleteUser(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.COMMON.SUCCESS,
      deleteUser,
    };
  }
}
