import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TradesService } from './trades.service';
import { update } from 'lodash';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { User } from 'src/entities/users/user.entity';
import { number } from 'joi';
import { TestDto } from './dto/test-dto';
import { MESSAGES } from 'src/commons/constants/trades/messages';

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  //테스트 메서드==============================
  @Get('hello')
  async hello() {
    return await this.tradesService.hello(5);
  }

  @Get('/test')
  async test(@Body() testDto: TestDto) {
    console.log('AAAAAAAAAAAAAAAAA');
    return await this.tradesService.test();
  }

  @Get('/change-role')
  @UseGuards(AuthGuard('jwt'))
  async changeRole(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.changeRole(user.id);
  }

  @Get('/schedule/:scheduleId')
  async changRemainSeat(@Param('scheduleId', ParseIntPipe) scheduleId: number) {
    return await this.tradesService.changRemainSeat(scheduleId);
  }

  //테스트 메서드==============================

  //중고 거래 로그 종회
  @Get('tradelogs')
  @UseGuards(AuthGuard('jwt'))
  async getLogs(@Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.getLogs(user.id);
  }

  //중고 거래 목록 조회
  @Get()
  async getList() {
    return await this.tradesService.getList();
  }

  //중고 거래 생성
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createTrade(@Body() createTradeDto: CreateTradeDto, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTrade(createTradeDto, user.id);
  }

  //중고 거래 상세 조회
  @Get('/:tradeId')
  async getTradeDetail(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.getTradeDetail(tradeId);
  }
  //첫 주솟값을 param으로 받는 콘트롤러 메서드
  //중고 거래 수정
  @Patch('/:tradeId')
  @UseGuards(AuthGuard('jwt'))
  async updateTrade(
    @Param('tradeId', ParseIntPipe) tradeId: number,
    @Body() updateTradeDto: UpdateTradeDto,
    @Req() req: { user: User }
  ) {
    const user = req.user;
    return await this.tradesService.updateTrade(tradeId, updateTradeDto, user.id);
  }

  //중고 거래 삭제
  @Delete('/:tradeId') //id는 인증과정에서 받을 예정
  @UseGuards(AuthGuard('jwt'))
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    await this.tradesService.deleteTrade(tradeId, user.id);
    return { message: MESSAGES.TRADES.SUCCESSFULLY_DELETE.TRADE };
  }

  //중고 거래 구매
  @Post('/:tradeId')
  @UseGuards(AuthGuard('jwt'))
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTicket(tradeId, user.id);
  }
}
