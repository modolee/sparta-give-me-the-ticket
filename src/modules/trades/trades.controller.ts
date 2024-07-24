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

  @Get()
  async getList() {
    return await this.tradesService.getList();
  }

  @Get()
  async getTradeDetail(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.getTradeDetail(tradeId);
  }

  @Post()
  async createTrade(@Body() createTradeDto: CreateTradeDto) {
    return await this.tradesService.createTrade(createTradeDto);
  }

  @Patch()
  async updateTrade(@Body() updateTradeDto: UpdateTradeDto) {
    return await this.tradesService.updateTrade(updateTradeDto);
  }

  @Delete()
  async deleteTrade(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.deleteTrade(tradeId);
  }

  @Post()
  async createTicket(@Param('tradeId', ParseIntPipe) tradeId) {
    return await this.tradesService.createTicket(tradeId);
  }
}
