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

  @Get('/sd')
  async getList() {
    return await this.tradesService.getList();
  }

  @Get()
  async getTradeDetail(@Param('/tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.getTradeDetail(tradeId);
  }

  @Post('/:tradeId')
  async createTrade(@Body() createTradeDto: CreateTradeDto, sellerId) {
    return await this.tradesService.createTrade(createTradeDto, sellerId);
  }

  @Patch()
  async updateTrade(@Body() updateTradeDto: UpdateTradeDto) {
    return await this.tradesService.updateTrade(updateTradeDto);
  }

  @Delete() //id는 인증과정에서 받을 예정
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId, id) {
    return await this.tradesService.deleteTrade(tradeId, id);
  }

  @Post()
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.createTicket(tradeId);
  }
}
