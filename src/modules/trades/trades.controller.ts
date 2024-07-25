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
} from '@nestjs/common';
import { TradesService } from './trades.service';
import { update } from 'lodash';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

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
  async createTrade(@Body() createTradeDto: CreateTradeDto, sellerId) {
    return await this.tradesService.createTrade(createTradeDto, sellerId);
  }

  //중고 거래 수정
  @Patch()
  async updateTrade(@Body() updateTradeDto: UpdateTradeDto) {
    return await this.tradesService.updateTrade(updateTradeDto);
  }

  //중고 거래 삭제
  @Delete() //id는 인증과정에서 받을 예정
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId, id) {
    return await this.tradesService.deleteTrade(tradeId, id);
  }

  //중고 거래 구매
  @Post('/:tradeId')
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.createTicket(tradeId);
  }

  //테스트 메서드
  @Get('test')
  async test(@Body() ticketId: number) {
    return await this.tradesService.test(ticketId);
  }
}
