import { Injectable } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(Trade)
    private TradeRepository: Repository<Trade>,
    @InjectRepository(TradeLog)
    private TradeLogRepository: Repository<TradeLog>,
    @InjectRepository(Show)
    private ShowRepository: Repository<Show>,
    @InjectRepository(Schedule)
    private ScheduleRepository: Repository<Schedule>,
    @InjectRepository(Ticket)
    private TicketRepository: Repository<Ticket>
  ) {}

  combineDateAndTime(dateStr: string, timeStr: string) {
    const date = new Date(dateStr);
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return date;
  }
  //=========ConvenienceFunction======================
  // async
  // async
  // async
  // async
  async getList() {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, showId: true, price: true },
    });

    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //show를 조회
        const show = await this.ShowRepository.findOne({
          where: { id: trade.showId },
        });
        //스케쥴을 조회
        const schedule = await this.ScheduleRepository.findOne({
          where: { id: trade.showId },
        });

        //show에서 장소와 이름을 추가,schedule에서 날짜와 시간을 추가
        if (show) {
          trade['location'] = show.location;
          trade['title'] = show.title;
          trade['date'] = schedule.date;
          trade['time'] = schedule.time;
        }
        return trade;
      })
    );

    return trade_list;
  }
  async getTradeDetail(tradeId: number) {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, showId: true, price: true, sellerId: true },
    });

    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //show를 조회
        const show = await this.ShowRepository.findOne({
          where: { id: trade.showId },
        });
        //스케쥴을 조회
        const schedule = await this.ScheduleRepository.findOne({
          where: { id: trade.showId },
        });

        //show에서 장소와 이름, 가격을 추가,schedule에서 날짜와 시간을 추가
        if (show) {
          trade['location'] = show.location;
          trade['title'] = show.title;
          trade['origin_price'] = show.price;
          trade['date'] = schedule.date;
          trade['time'] = schedule.time;
        }
        return trade;
      })
    );

    return trade_list;
  }

  //sellerId는 인증을 통해 받게 될 예정
  async createTrade(createTradeDto: CreateTradeDto) {
    const { ticketId, price } = createTradeDto;

    let result = { price };
    //ticket에서 showId를 추출
    const ticket = await this.TicketRepository.findOne({
      where: { id: ticketId },
    });

    const showId: number = ticket.showId;

    const schedule = await this.ScheduleRepository.findOne({ where: { showId } });

    return { 1: schedule.date, 2: schedule.time };
  }
  async updateTrade(updateTradeDto: UpdateTradeDto) {}
  async deleteTrade(tradeId: number) {}
  async createTicket(tradeId: number) {}
}
