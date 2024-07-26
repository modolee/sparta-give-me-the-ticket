import { Injectable, Inject } from '@nestjs/common';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Redis } from 'ioredis';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';
import { number } from 'joi';

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
    private TicketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private UserRepository: Repository<User>,
    @Inject('REDIS_CLIENT') private redisClient: Redis
  ) {}

  combineDateAndTime(dateStr: string, timeStr: string) {
    const date = new Date(dateStr);
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return date;
  }

  //티켓 정보를 레디스에 저장하는 함수
  async addRedisTicket(createTicketId: string, expired: Date) {
    const value = 'TRUE'; //해당 키에 저장되는 값
    const key = createTicketId;
    const unixTimeStamp = Math.floor(expired.getTime() / 1000);

    await this.redisClient.set(createTicketId, value, (err, result) => {
      if (err) {
        throw new Error('티켓을 생성할 수 없습니다 Redis에 에러 발생');
      } else {
        this.redisClient.expireat(key, unixTimeStamp, (err, result) => {
          if (err) {
            throw new Error('티켓을 생성할 수 없습니다 Redis에 에러 발생');
          } else {
            return { message: '성공적으로 티켓이 발급되었습니다.' };
          }
        });
      }
    });
  }

  //티켓 정보를 레디스에서 제거하는 함수
  async deleteRedisTicket(deleteTicketId: string) {
    await this.redisClient.del(deleteTicketId, (err, result) => {
      if (err) {
        throw new Error('티켓을 생성할 수 없습니다 Redis에 에러 발생');
      } else {
        return { message: '레디스에서 성공적으로 티켓이 제거 되었습니다.' };
      }
    });
  }

  //티켓 만료시간을 반환하는 함수
  async returnCloseTime(ticketId: number) {
    const ticket = await this.TicketRepository.findOne({ where: { id: ticketId } });

    const { date, time } = ticket;

    const combinedString = `${String(date)}T${String(time)}`;

    const minMinutes = 60 * 1000 * 60;

    const showTime = new Date(combinedString);

    const closeTime = new Date(showTime.getTime() - minMinutes);

    return closeTime;
  }
  //티켓이 활성 상태임을 알려주는 함수
  async checkRedisTicket(getTicketId: number) {
    const ticket = await this.redisClient.get(String(getTicketId));
    if (ticket) return true;
    else return false;
  }

  //=========ConvenienceFunction======================
  //중고 거래 목록 보기//완료
  async getList() {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, showId: true, price: true },
    });

    //중고 거래 목록 조회
    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //스케쥴을 조회
        const ticket = await this.TicketRepository.findOne({
          where: { id: trade.ticketId },
        });

        //show에서 장소와 이름을 추가,schedule에서 날짜와 시간을 추가
        if (ticket) {
          trade['date'] = ticket.date;
          trade['time'] = ticket.time;
        }
        return trade;
      })
    );
    if (!trade_list[0]) {
      return { message: '중고거래 목록이 존재하지 않습니다' };
    }

    return trade_list;
  }

  //중고 거래 상세 보기 //완료
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

  //중고거래 생성 함수 //완료(검증 대부분 완료)
  //sellerId는 인증을 통해 받게 될 예정 //sellerId,ticket_id,showId,price 까지 구함, closedAt만 구하면 됨(반쯤 구한듯 하다)
  async createTrade(createTradeDto: CreateTradeDto, sellerId: number) {
    const { ticketId, price } = createTradeDto;

    //검증 타일 START==================================================

    //티켓이 존재하는지 검증
    const ticket = await this.TicketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('해당 티켓이 존재하지 않습니다');

    //해당 티켓이 사용 가능한지 검증 (레디스 검증)
    if (!(await this.redisClient.get(String(ticketId))))
      throw new Error('해당 티켓은 환불도 거래도 불가능합니다!');

    //가격이 기존의 티켓 가격보다 같거나 낮은지 검증
    if (ticket.price < price) {
      throw new Error('원래 티켓 가격보다 높게 설정할 수 없습니다!');
    }

    //본인의 티켓인지 검증
    if (ticket.userId !== sellerId) {
      return new Error('본인의 티켓만 판매 가능합니다!');
    }

    const showId = ticket.showId;

    //해당 공연이 존재하는지 검증
    const show = await this.ShowRepository.findOne({ where: { id: showId } });
    if (!show) throw new NotFoundException('해당 공연이 존재하지 않습니다');

    const schedule = await this.ScheduleRepository.findOne({
      where: { showId: showId, time: ticket.time },
    });

    //해당 일정이 존재하는지 검증
    if (!schedule) throw new NotFoundException('해당 일정이 존재하지 않습니다');
    //검증 타일 END==================================================

    //정책에 따라 티켓의 가격을 중고거래 게시된 시점의 가격으로 고정
    await this.TicketRepository.update({ id: ticketId }, { price: price });

    const closedAt = await this.returnCloseTime(ticket.id);

    return await this.TradeRepository.save({ sellerId, ticketId, showId, price, closedAt });

    // return { sellerId, ticketId, showId, price, closedAt };
  }

  //중고 거래 수정 메서드 //Id 값만 가져와서 검증만 추가하면 완료
  async updateTrade(updateTradeDto: UpdateTradeDto) {
    const { price, tradeId } = updateTradeDto;

    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(`해당 거래가 존재하지 않습니다`);

    return await this.TradeRepository.update(tradeId, { price });
  }

  //중고 거래 삭제 메서드  //Id 값만 가져와서 검증만 추가하면 완료
  async deleteTrade(tradeId: number, id) {
    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(`해당 거래가 존재하지 않습니다`);
    return await this.TradeRepository.delete(tradeId);
  }

  //티켓 구매 메서드
  async createTicket(tradeId: number, buyerId: number) {
    //해당 거래 존재 확인
    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(`해당 거래가 존재하지 않습니다`);

    let ticket = await this.TicketRepository.findOne({ where: { id: trade.ticketId } });

    //buyer의 유저 정보 가져오기
    const buyer = await this.UserRepository.findOne({ where: { id: buyerId } });

    //현재 가장 높은 ticketId보다 1 높은 값 (새로 재발급 하기 위해서)
    let query = await this.TicketRepository.query('SELECT MAX(id) AS maxId FROM tickets');
    const newId = query[0].maxId + 1;

    //새로운 티켓 id를 레디스에 저장
    this.addRedisTicket(String(newId), trade.closedAt);

    //티켓 재발급 로직==================
    //새로운 티켓을 생성하고 그 정보를 데이터베이스에 저장
    ticket.userId = buyerId;

    await this.TicketRepository.save({
      userId: ticket.userId,
      showId: ticket.showId,
      scheduleId: ticket.scheduleId,
      nickname: buyer.nickname,
      title: ticket.title,
      time: ticket.time,
      runtime: ticket.runtime,
      date: ticket.date,
      location: ticket.location,
      price: ticket.price,
    });

    // //기존에 존재하는 id를 레디스에서 제거
    this.deleteRedisTicket(String(trade.ticketId));

    return { newId };
  }

  //=======================
  async test(ticketId: number) {
    if (await this.checkRedisTicket(ticketId)) {
      return { message: '티켓이 존재합니다.' };
    } else {
      return { message: '티켓이 존재하지 않습니다' };
    }
  }
}
