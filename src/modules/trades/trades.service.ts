//others

import { addHours, startOfDay, subDays, subHours } from 'date-fns';

//Dto
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';

//error Type
import {
  Injectable,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

//DIP
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Repository } from 'typeorm';

//constants
import { SERVER } from '../../commons/constants/server.constants';
import { MESSAGES } from 'src/commons/constants/trades/messages';

//transaction
import { Redis } from 'ioredis';
import { Queue } from 'bullmq';
import { DataSource, Like } from 'typeorm';

//types
import { QUEUES } from 'src/commons/constants/queue.constant';
import { Role } from 'src/commons/types/users/user-role.type';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { number } from 'joi';

//entities
import { Trade } from 'src/entities/trades/trade.entity';
import { TradeLog } from 'src/entities/trades/trade-log.entity';
import { Show } from 'src/entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { User } from 'src/entities/users/user.entity';

//DataSource File

// const AppDataSource = new DataSource({
//   type: 'mysql',
//   host: SERVER.HOST,
//   port: +SERVER.PORT,
//   username: SERVER.USER,
//   password: SERVER.PASSWORD,
//   database: SERVER.DATABASE,
//   entities: [Trade, TradeLog, Show, Schedule, Ticket, User],
//   synchronize: true,
//   logging: false,
// });

// AppDataSource.initialize()
//   .then(() => {
//     console.log('Data Source has been initialized!');
//   })
//   .catch((err) => {
//     console.error(`Error during Data Source initialization:`, err);
//   });

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
    @InjectQueue(QUEUES.TRADE_QUEUE) private ticketQueue: Queue,

    private dataSource: DataSource,
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
        throw new Error(
          `${MESSAGES.TRADES.CAN_NOT_CREATE.TICKET} ${MESSAGES.TRADES.ERROR_OCCUR.REDIS}`
        );
      } else {
        this.redisClient.expireat(key, unixTimeStamp, (err, result) => {
          if (err) {
            throw new Error(
              `${MESSAGES.TRADES.CAN_NOT_CREATE.TICKET} ${MESSAGES.TRADES.ERROR_OCCUR.REDIS}`
            );
          } else {
            return { message: `${MESSAGES.TRADES.SUCCESSFULLY_CREATE.TICKET} ${'-Redis에서'}` };
          }
        });
      }
    });
  }

  //티켓 정보를 레디스에서 제거하는 함수
  async deleteRedisTicket(deleteTicketId: string) {
    await this.redisClient.del(deleteTicketId, (err, result) => {
      if (err) {
        throw new Error(
          `${MESSAGES.TRADES.CAN_NOT_CREATE.TICKET} ${MESSAGES.TRADES.ERROR_OCCUR.REDIS}`
        );
      } else {
        return { message: MESSAGES.TRADES.SUCCESSFULLY_DELETE.REDIS_TICKET };
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

  //<1> 중고 거래 목록 보기//완료 (검증 대부분 완료)
  async getList() {
    let trade_list = await this.TradeRepository.find({
      select: { id: true, ticketId: true, createdAt: true, closedAt: true },
    });

    //중고 거래 목록 조회 //테스트 완료
    //trade_list에 공연에서 가져온 주소값을 병합
    trade_list = await Promise.all(
      trade_list.map(async (trade) => {
        //스케쥴을 조회
        const ticket = await this.TicketRepository.findOne({
          where: { id: trade.ticketId },
        });

        //show에서 장소와 이름을 추가,schedule에서 날짜와 시간을 추가
        if (ticket) {
          trade['title'] = ticket.title;
          trade['price'] = ticket.price;
          trade['date'] = ticket.date;
          trade['time'] = ticket.time;
          delete trade.ticketId;
        }
        return trade;
      })
    );
    if (!trade_list[0]) {
      return { message: MESSAGES.TRADES.NOT_EXISTS.TRADE_LIST };
    }

    return trade_list;
  }

  //<2> 중고 거래 상세 보기 //수정 필요 리스트가 아님 (검증 대부분 완료) //테스트 완료
  async getTradeDetail(tradeId: number) {
    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);
    const show = await this.ShowRepository.findOne({ where: { id: trade.showId } });
    if (!show) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SHOW);
    const ticket = await this.TicketRepository.findOne({ where: { id: trade.ticketId } });
    if (!ticket) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TICKET);

    trade['title'] = show.title;
    trade['origin_price'] = show.price;
    trade['location'] = ticket.location;
    trade['date'] = ticket.date;
    trade['time'] = ticket.time;
    delete trade.ticketId;
    delete trade.flag;
    delete trade.showId;

    return trade;
  }

  //<3> 중고거래 생성 함수 //완료(검증 대부분 완료) 테스트 완료
  async createTrade(createTradeDto: CreateTradeDto, sellerId: number) {
    const { ticketId, price } = createTradeDto;

    //검증 타일 START==================================================

    //1.데이터 베이스 검증

    //1-1 티켓이 존재하는지 검증
    const ticket = await this.TicketRepository.findOne({ where: { id: ticketId } });
    const { date, time } = ticket;
    if (!ticket) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TICKET);

    const showId = ticket.showId;

    //1-2 해당 공연이 존재하는지 검증
    const show = await this.ShowRepository.findOne({ where: { id: showId } });
    if (!show) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SHOW);

    //1-3 해당 일정이 존재하는지 검증
    const schedule = await this.ScheduleRepository.findOne({
      where: { showId: showId, time: ticket.time },
    });

    if (!schedule) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SCHEDULE);

    //1-4 이미 이 티켓이 중고거래에 올라와있는지 검증
    const trade = await this.TradeRepository.find({ where: { ticketId: ticketId } });

    if (trade[0]) return { message: MESSAGES.TRADES.ALREADY_EXISTS.IN_TRADE_TICKET };

    //해당 티켓이 사용 가능한지 검증 (레디스 검증과 티켓의 날짜와 시간에 따른 검증)
    if (
      !(await this.redisClient.get(String(ticketId))) &&
      new Date().getTime() >=
        this.combineDateAndTime(String(date), time).getTime() - 60 * 1000 * 60 * 2
    )
      throw new BadRequestException(MESSAGES.TRADES.IS_EXPIRED.TICKET);

    //가격이 기존의 티켓 가격보다 같거나 낮은지 검증
    if (ticket.price < price) {
      throw new BadRequestException(
        `${MESSAGES.TRADES.CAN_NOT_UPDATE.TICKET_PRICE} 원래가격: ${show.price}, 현재가격 ${ticket.price}`
      );
    }

    //본인의 티켓인지 검증
    if (ticket.userId !== sellerId) {
      return new BadRequestException(MESSAGES.TRADES.NOT_EXISTS.AUTHORITY);
    }

    //검증 타일 END==================================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //정책에 따라 티켓의 가격을 중고거래 게시된 시점의 가격으로 고정
      await queryRunner.manager.update(Ticket, { id: ticketId }, { price: price });

      const closedAt = await this.returnCloseTime(ticket.id);
      const trade = await queryRunner.manager.save(Trade, {
        sellerId,
        ticketId,
        showId,
        price,
        closedAt,
      });

      //트레이드 로그에 기록
      const log = { tradeId: trade.id, sellerId };
      await queryRunner.manager.save(TradeLog, log);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: MESSAGES.TRADES.CAN_NOT_CREATE.TRADE };
    } finally {
      queryRunner.release();
    }

    // const closedAt = await this.returnCloseTime(ticket.id);
    // return await this.TradeRepository.save({ sellerId, ticketId, showId, price, closedAt });

    // //정책에 따라 티켓의 가격을 중고거래 게시된 시점의 가격으로 고정
    // await this.TicketRepository.update({ id: ticketId }, { price: price });
    // const closedAt = await this.returnCloseTime(ticket.id);

    // return { sellerId, ticketId, showId, price, closedAt };
  }

  //<4> 중고 거래 수정 메서드 //완료(검증 대부분 완료)  //테스트 완료
  async updateTrade(tradeId, updateTradeDto: UpdateTradeDto, userId: number) {
    const { price } = updateTradeDto;

    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);

    if (trade.sellerId !== userId)
      throw new BadRequestException(MESSAGES.TRADES.NOT_EXISTS.AUTHORITY);

    //티켓과 중고거래의 가격 둘다 변경(어차피 참고하는 것은 티켓의 가격뿐이기에, 추후 수정 예정, 엔티티에서 중고거래의 가격은 사라져도 될것으로 보임)
    await this.TradeRepository.update({ id: tradeId }, { price: price });
    await this.TicketRepository.update({ id: trade.ticketId }, { price: price });

    const afterTrade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    return afterTrade;
  }

  //<5> 중고 거래 삭제 메서드  //완료(검증 대부분 완료)
  async deleteTrade(tradeId: number, userId: number) {
    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);

    if (trade.sellerId !== userId) {
      throw new BadRequestException(MESSAGES.TRADES.NOT_EXISTS.AUTHORITY);
    }

    //모든 검증이 끝난 뒤 삭제 로직
    return await this.TradeRepository.delete(tradeId);
  }

  //<6> 티켓 구매 메서드 (buyerId는 기존의 userId와 같다) (현재 수정중)
  async createTicket(tradeId: number, buyerId: number) {
    //해당 거래 존재 확인

    const trade = await this.TradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TRADE);

    //해당 티켓 존재 확인

    let ticket = await this.TicketRepository.findOne({ where: { id: trade.ticketId } });
    if (!ticket) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.TICKET);

    //구매자와 판매자의 유저 정보 가져오기

    const seller = await this.UserRepository.findOne({ where: { id: ticket.userId } });
    if (!seller) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.SELLER);
    const buyer = await this.UserRepository.findOne({ where: { id: buyerId } });
    if (!buyer) throw new NotFoundException(MESSAGES.TRADES.NOT_EXISTS.BUYER);

    //현재 가장 높은 ticketId보다 1 높은 값 (새로 재발급 하기 위해서)
    let query = await this.TicketRepository.query('SELECT MAX(id) AS maxId FROM tickets');
    const newId = query[0].maxId + 1;

    //<6-1>쿼리 러너문 만들기=========트랜잭션 시작=========가져온 변수:trade,ticket,seller,buyer,===============================================
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //새로운 티켓 id를 레디스에 저장
      this.addRedisTicket(String(newId), trade.closedAt);

      //검증 타일===================
      if (buyer.point < ticket.price)
        throw new BadRequestException(MESSAGES.TRADES.NOT_ENOUGH.MONEY);
      buyer.point -= ticket.price;
      await queryRunner.manager.save(User, buyer);

      //tradeLog데이타베이스에도 저장
      const log = { tradeId: tradeId, buyerId, sellerId: seller.id };
      await queryRunner.manager.save(TradeLog);

      //구매자에게 전할 새로운 티켓을 생성하고 새로운 티켓을 데이터베이스에 저장
      const newTicket = ticket;
      newTicket.userId = buyerId;
      newTicket.nickname = buyer.nickname;

      await queryRunner.manager.save(Ticket, newTicket);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return { message: MESSAGES.TRADES.FAILED.PURCHASE };
    } finally {
      await queryRunner.release();
    }

    //티켓 재발급 로직==================

    // //기존에 존재하는 id를 레디스에서 제거
    this.deleteRedisTicket(String(trade.ticketId));

    return { newId };
  }

  //중고 거래 로그 조회
  async getLogs(userId: number) {
    const buyLogs = await this.TradeLogRepository.find({
      where: { buyerId: userId },
    });
    const sellLogs = await this.TradeLogRepository.find({
      where: { sellerId: userId },
    });

    // buyLogs와 sellLogs 병합
    const logs = [...buyLogs, ...sellLogs];

    // 병합된 배열을 id 기준으로 정렬
    logs.sort((a, b) => a.id - b.id);

    if (!logs[0]) return { message: MESSAGES.TRADES.NOT_EXISTS.TRADE_LOG };
    else return logs;
  }

  //=======================테스트 함수 START====================
  async hello(a: number) {
    return { message: 'hello' };
  }

  async test() {
    console.log('bbbbbbbbbbbbbbbbbbbbbbbb');
    // return {
    //   PORT: process.env.SERVER_PORT,
    //   HOST: process.env.DB_HOST,
    //   USER: process.env.DB_USER,
    //   PASSWORD: process.env.DB_PASSWORD,
    //   DATABASE: process.env.DB_NAME,
    // };
  }

  async changeRole(userId: number) {
    const user = await this.UserRepository.findOne({ where: { id: userId } });

    if (user.role === Role.USER) {
      await this.UserRepository.update({ id: userId }, { role: Role.ADMIN });
      return { message: MESSAGES.TRADES.SUCCESSFULLY_UPDATE.CHANGE_ROLE_ADMIN };
    } else if (user.role === Role.ADMIN) {
      await this.UserRepository.update({ id: userId }, { role: Role.USER });
      return { message: MESSAGES.TRADES.SUCCESSFULLY_UPDATE.CHANGE_ROLE_USER };
    }
  }

  async changRemainSeat(scheduleId) {
    const seat: number = 45;
    await this.ScheduleRepository.update({ id: scheduleId }, { remainSeat: seat });
    return { message: `좌석이 ${seat}로 수정되었습니다.` };
  }
  //=======================테스트 함수 END====================
}
