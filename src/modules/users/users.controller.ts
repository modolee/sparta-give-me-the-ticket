import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';

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

  // 사용자 정보 수정
  @Patch('/me')
  async updateUser() {
    return await this.userService.updateUser();
  }

  // 사용자 포인트 충전
  @Post('/me/point')
  async chargePoint() {
    return await this.userService.chargePoint();
  }

  // 회원 탈퇴
  @Delete('/me')
  async deleteUser() {
    return await this.userService.deleteUser();
  }
}
