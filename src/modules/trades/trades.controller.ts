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

@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  //중고 거래 목록 조회
  @Get('')
  async getList() {
    return await this.tradesService.getList();
  }

  //중고 거래 상세 조회
  @Get()
  async getTradeDetail(@Param('/tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.getTradeDetail(tradeId);
  }

  //중고 거래 생성
  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createTrade(@Body() createTradeDto: CreateTradeDto, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTrade(createTradeDto, user.id);
  }

  //중고 거래 수정
  @Patch()
  @UseGuards(AuthGuard('jwt'))
  async updateTrade(@Body() updateTradeDto: UpdateTradeDto, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.updateTrade(updateTradeDto, user.id);
  }

  //중고 거래 삭제
  @Delete() //id는 인증과정에서 받을 예정
  @UseGuards(AuthGuard('jwt'))
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.deleteTrade(tradeId, user.id);
  }

  //중고 거래 구매
  @Post('/:tradeId')
  @UseGuards(AuthGuard('jwt'))
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId, @Req() req: { user: User }) {
    const user = req.user;
    return await this.tradesService.createTicket(tradeId, user.id);
  }

  //테스트 메서드
  @Get('test')
  async test(@Body('ticketId') ticketId: number) {
    return await this.tradesService.test(ticketId);
  }
}
