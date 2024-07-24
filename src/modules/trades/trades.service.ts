import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create.trade.dto';
import { UpdateTradeDto } from './dto/update.trade.dto';
@Injectable()
export class TradesService {
  // async
  // async
  // async
  // async
  async getList() {}
  async getTradeDetail(tradeId:number) {}
  async createTrade(createTradeDto: CreateTradeDto) {}
  async updateTrade(updateTradeDto: UpdateTradeDto) {}
  async deleteTrade(tradeId:number) {}
  async createTicket(tradeId:number) {}
}
