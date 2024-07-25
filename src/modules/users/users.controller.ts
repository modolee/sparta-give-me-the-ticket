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
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { UserUpdateDto } from './dto/user-update.dto';
import { ChargePointDto } from './dto/charge-point.dto';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // 포인트 내역 조회
  @Get('/me/point')
  async getPointLog() {
    return await this.userService.getPointLog();
  }

  // 예매 목록 조회
  @Get('/me/ticket')
  async getTicketList() {
    return await this.userService.getTicketList();
  }

  // 북마크 목록 조회
  @Get('/me/bookmark')
  async getBookmarkList() {
    return await this.userService.getBookmarkList();
  }

  // 거래 내역 조회
  @Get('/me/trade')
  async getTradeLog() {
    return await this.userService.getTradeLog();
  }

  /**
   * 사용자 정보 수정
   * @param req
   * @param userUpdateDto
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  @Post('/me/point')
  async chargePoint(@Req() req: any, @Body() chargePointDto: ChargePointDto) {
    const updateUserPoint = await this.userService.chargePoint(req.user.id, chargePointDto);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.POINT_CHARGE.SUCCESS,
      updateUserPoint,
    };
  }

  /**
   * 회원 탈퇴
   * @param req
   * @returns
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('/me')
  async deleteUser(@Req() req: any) {
    const deleteUser = await this.userService.deleteUser(req.user.id);

    return {
      statusCode: HttpStatus.OK,
      message: USER_MESSAGES.USER.COMMON.IS_DELETED,
      deleteUser,
    };
  }
}
