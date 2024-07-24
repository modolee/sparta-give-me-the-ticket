import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private TradeRepository: Repository<Trade>,
    @InjectRepository(TradeLog)
    private TradeLogRepository: Repository<TradeLog>,
    @InjectRepository(Show)
    private ShowRepository: Repository<Show>
  ) {}
  // async
  // async
  // async
  // async
  async getList() {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, showId: true, price: true, closedAt: true },
    });

    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        const show = await this.ShowRepository.findOne({
          where: { id: trade.showId },
          select: { location: true },
        });
        if (show) {
          trade['location'] = show.location;
        }
        return trade;
      })
    );

    return trade_list;
  }
  async getTradeDetail(tradeId: number) {
    const trade = await this.TradeRepository.findOne({ select: { sellerId: true, showId: true } });
  }
  async createTrade(createTradeDto: CreateTradeDto) {}
  async updateTrade(updateTradeDto: UpdateTradeDto) {}
  async deleteTrade(tradeId: number) {}
  async createTicket(tradeId: number) {}
}
