import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { User } from 'src/entities/users/user.entity';
import { DataSource, Like, Repository } from 'typeorm';
import { CreateShowDto } from './dto/create-show.dto';
import { USER_BOOKMARK_MESSAGES } from 'src/commons/constants/users/user-bookmark-messages.constant';
import { SHOW_TICKET_MESSAGES } from 'src/commons/constants/shows/show-ticket-messages.constant';
import { SHOW_TICKETS } from 'src/commons/constants/shows/show-tickets.constant';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';
import { addHours, isBefore, startOfDay, subDays, subHours } from 'date-fns';
import { UpdateShowDto } from './dto/update-show.dto';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { GetShowListDto } from './dto/get-show-list.dto';
import { CreateTicketDto } from './dto/create-ticket-dto';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show) private showRepository: Repository<Show>,
    @InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    @InjectQueue('ticketQueue') private ticketQueue: Queue,
    private dataSource: DataSource
  ) {}

  /*공연 생성 */
  async createShow(createShowDto: CreateShowDto, req: any) {
    const { schedules, ...restOfShow } = createShowDto;

    //공연 명 기준으로 이미 있는 공연인지 확인
    const existedShow = await this.showRepository.findOne({
      where: { title: createShowDto.title, deletedAt: null },
    });

    if (existedShow) {
      throw new ConflictException(SHOW_MESSAGES.COMMON.TITLE.EXISTED);
    }

    //공연 생성
    const show = await this.showRepository.create({
      ...restOfShow,
      userId: req.user.id,
      //이미지 url 받기
      schedules: schedules.map((schedule) => ({
        ...schedule,
        remainSeat: restOfShow.totalSeat,
      })),
    });

    //생성한 공연 DB에 저장
    await this.showRepository.save(show);

    return {
      status: HttpStatus.CREATED,
      message: SHOW_MESSAGES.CREATE.SUCCEED,
      data: {
        id: show.id,
        userId: show.userId,
        title: show.title,
        content: show.content,
        category: show.category,
        runtime: show.runtime,
        location: show.location,
        price: show.price,
        totalSeat: show.totalSeat,
        schedules: show.schedules.map(({ date, time, remainSeat }) => ({
          date,
          time,
          remainSeat,
        })),
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
        deletedAt: show.deletedAt,
      },
    };
  }

  /*공연 목록 조회 */
  async getShowList(getShowListDto: GetShowListDto) {
    const { category, search, page, limit } = getShowListDto;

    const [shows, total] = await this.showRepository.findAndCount({
      where: {
        ...(category && { category }),
        ...(search && { title: Like(`%${search}%`) }),
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      status: HttpStatus.CREATED,
      message: SHOW_MESSAGES.GET_LIST.SUCCEED.LIST,
      data: shows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /*공연 상세 조회 */
  async getShow(showId: number) {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: { schedules: true },
    });

    //공연 존재 여부 확인
    if (!show) {
      throw new NotFoundException(SHOW_MESSAGES.COMMON.NOT_FOUND);
    }

    return {
      status: HttpStatus.OK,
      message: SHOW_MESSAGES.GET.SUCCEED,
      data: {
        id: show.id,
        userId: show.userId,
        title: show.title,
        content: show.content,
        category: show.category,
        runtime: show.runtime,
        location: show.location,
        price: show.price,
        totalSeat: show.totalSeat,
        schedules: show.schedules.map(({ date, time }) => ({
          date,
          time,
        })),
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
        deletedAt: show.deletedAt,
      },
    };
  }

  /*공연 수정 */
  async updateShow(showId: number, updateShowDto: UpdateShowDto) {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: { schedules: true },
    });

    //공연 존재 여부 확인
    if (!show) {
      console.log('showId: ', show.id);
      throw new NotFoundException(SHOW_MESSAGES.COMMON.NOT_FOUND);
    }

    //요청 바디가 비어있는지 확인
    if (Object.keys(updateShowDto).length === 0) {
      throw new BadRequestException(SHOW_MESSAGES.UPDATE.NO_BODY_DATE);
    }

    //총 좌석수는 제외
    if ('totalSeat' in updateShowDto) {
      throw new BadRequestException(SHOW_MESSAGES.UPDATE.TOTAL_SEAT);
    }

    // 공연 업데이트
    Object.assign(show, updateShowDto);

    //이미지 삭제, 이미지 추가

    //변경 사항 저장
    await this.showRepository.save(show);

    //수정 완료
    return {
      status: HttpStatus.OK,
      message: SHOW_MESSAGES.UPDATE.SUCCEED,
    };
  }

  /*공연 삭제 */
  async deleteShow(showId: number) {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: { schedules: true },
    });

    //공연 존재 여부 확인
    if (!show) {
      throw new NotFoundException(SHOW_MESSAGES.COMMON.NOT_FOUND);
    }

    //공연 삭제
    show.deletedAt = new Date();

    //스케줄 삭제
    show.schedules.forEach((schedule) => {
      schedule.deletedAt = new Date();
    });

    //DB에 저장
    await this.scheduleRepository.save(show.schedules);

    await this.showRepository.save(show);

    return {
      status: HttpStatus.OK,
      message: SHOW_MESSAGES.DELETE.SUCCEED,
    };
  }

  /*공연 찜하기 생성 */
  async createBookmark(showId: number, user: User) {
    // 찜할 공연을 찾습니다.
    const show = await this.showRepository.findOne({ where: { id: showId } });
    if (!show) {
      throw new NotFoundException(USER_BOOKMARK_MESSAGES.COMMON.SHOW.NOT_FOUND);
    }

    // // 이미 찜했을 경우에 에러 메시지를 발생합니다.
    const bookmark = await this.bookmarkRepository.findOne({
      where: { showId, userId: user.id },
    });
    if (bookmark) {
      throw new ConflictException(USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.ALREADY_EXISTS);
    }

    // 찜하기를 하지 않았을 경우에 새로운 찜하기를 생성합니다.
    const newBookmark = this.bookmarkRepository.create({
      showId,
      userId: user.id,
    });

    await this.bookmarkRepository.save(newBookmark);

    return newBookmark;
  }

  /*공연 찜하기 취소 */
  async deleteBookmark({ bookmarkId, showId }: DeleteBookmarkDto) {
    // 본인이 찜한 공연이 있는지 확인합니다.
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id: bookmarkId, showId },
    });

    if (!bookmark) {
      throw new NotFoundException(USER_BOOKMARK_MESSAGES.COMMON.CANCEL_BOOKMARK.NOT_FOUND);
    }
    // 찜하기를 취소합니다. (hard delete)
    await this.bookmarkRepository.delete({ id: bookmarkId });
    return bookmark;

    //remove 검색, delete는 id 값을 넘겨줘야한다.
  }

  /* 티켓 예매 */
  async createTicket(showId: number, createTicketDto: CreateTicketDto, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { scheduleId } = createTicketDto;
      // 공연이 있는지 확인합니다.
      const show = await queryRunner.manager.findOne(Show, {
        where: { id: showId },
      });
      if (!show) {
        throw new NotFoundException(SHOW_TICKET_MESSAGES.COMMON.SHOW.NOT_FOUND);
      }

      // 스케줄이 있는지 확인합니다.
      const schedule = await queryRunner.manager.findOne(Schedule, {
        where: {
          id: scheduleId,
        },
      });
      if (!schedule) {
        throw new NotFoundException(SHOW_TICKET_MESSAGES.COMMON.SCHEDULE.NOT_FOUND);
      }

      //지정 좌석이 있는지 확인합니다.
      if (schedule.remainSeat <= SHOW_TICKETS.COMMON.SEAT.UNSIGNED) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.SEAT.NOT_ENOUGH);
      }

      //date와 time을 하나의 showTime으로 연결합니다.
      const showTime = `${String(schedule.date)}T${String(schedule.time)}`;

      // 공연 시간 기준 2시간 전
      const twoHoursBeforeShowTime = subHours(showTime, 2);
      const nowTime = new Date();
      if (nowTime >= twoHoursBeforeShowTime) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.TIME.EXPIRED);
      }

      if (user.point < show.price) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.POINT.NOT_ENOUGH);
      }

      // 사용자의 포인트 차감
      user.point -= show.price;
      await queryRunner.manager.save(User, user);

      const ticket = queryRunner.manager.create(Ticket, {
        userId: user.id,
        scheduleId: schedule.id,
        showId: show.id,
        nickname: user.nickname,
        title: show.title,
        time: schedule.time,
        runtime: show.runtime,
        date: schedule.date,
        location: show.location,
        price: show.price,
      });

      await queryRunner.manager.save(Ticket, ticket);

      // 좌석 차감 처리
      schedule.remainSeat -= SHOW_TICKETS.COMMON.SEAT.DEDUCTED;

      await queryRunner.manager.save(Schedule, schedule);
      await queryRunner.commitTransaction();

      return ticket;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }

  /* 티켓 예매 동시성 처리 */
  async addTicketQueue(showId: number, createTicketDto: CreateTicketDto, user: User) {
    const job = await this.ticketQueue.add('ticket', {
      showId,
      user,
      createTicketDto,
    });
  }

  /*티켓 환불 */
  async refundTicket(showId: number, ticketId: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // 환불할 티켓이 있는지 확인합니다.
      const ticket = await queryRunner.manager.findOne(Ticket, {
        where: {
          id: ticketId,
          showId,
        },
      });

      if (!ticket) {
        throw new NotFoundException(SHOW_TICKET_MESSAGES.COMMON.TICKET.NOT_FOUND);
      }

      const showTime = `${String(ticket.date)}T${String(ticket.time)}.000Z`;

      // 현재의 시간에서 1시간 전으로 시간 제한을 설정
      const oneHoursBeforeShowTime = subHours(
        showTime,
        SHOW_TICKETS.COMMON.TICKET.HOURS.BEFORE_ONE_HOURS
      );
      //현재 시간 - 기준은 UTC 시간으로 되어있습니다.
      const nowTime = new Date();
      // 티켓 예매 시점 확인 (티켓의 생성 시점)
      const bookingTime = new Date(ticket.createdAt);
      // 공연 시작 3일 전, 10일 전 시간 계산
      const threeDaysBeforeShow = subDays(
        showTime,
        SHOW_TICKETS.COMMON.TICKET.HOURS.BEFORE_THREE_DAYS
      );
      const tenDaysBeforeShow = subDays(showTime, SHOW_TICKETS.COMMON.TICKET.HOURS.BEFORE_TEN_DAYS);
      // 공연 시작 최대 24시간 이내
      const oneDayAfterBooking = addHours(
        bookingTime,
        SHOW_TICKETS.COMMON.TICKET.HOURS.AFTER_TWENTY_FOUR_HOURS
      );
      // 공연 당일의 가장 빠른 시간 (00:00) 설정
      const earlyTime = startOfDay(showTime);

      // 환불 정책에 따른 비율 계산
      let refundPoint;

      // 공연 시간이 현재 시간 기준으로 1시간 이전일 경우 환불하기 어렵다는 메시지 전달
      if (nowTime >= oneHoursBeforeShowTime) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.EXPIRED);
      }

      // 공연 시작 10일 전까지(마지노선) 전액 환불
      if (nowTime <= tenDaysBeforeShow) {
        refundPoint = ticket.price;
      }

      //공연 시작 3일 전까지는 50% 환불
      else if (tenDaysBeforeShow < nowTime && nowTime <= threeDaysBeforeShow) {
        // 공연 예매 후 현재 시간이 공연 예매 시간의 24시간 이내면 전액 환불
        if (nowTime <= oneDayAfterBooking) {
          refundPoint = ticket.price;
        } else {
          refundPoint = Math.floor(ticket.price * SHOW_TICKETS.COMMON.TICKET.PERCENT.FIFTY);
        }
      }

      // 현재 시간이 공연 날짜의 00시부터 공연 시작 전 1시간 사이면 10퍼센트 환불
      else if (oneHoursBeforeShowTime > nowTime && nowTime > earlyTime) {
        refundPoint = Math.floor(ticket.price * SHOW_TICKETS.COMMON.TICKET.PERCENT.TEN);
      }

      // 티켓의 환불이 이미 됐을경우 메시지를 날립니다.
      if (ticket.status == SHOW_TICKETS.COMMON.TICKET.REFUND_STATUS) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.ALREADY_REFUNDED);
      }

      // 티켓 상태를 환불로 업데이트를 합니다.
      ticket.status = TicketStatus.REFUNDED;

      await queryRunner.manager.save(Ticket, ticket);

      user.point += refundPoint;
      console.log(refundPoint);
      await queryRunner.manager.save(User, user);

      // 잔여 좌석을 증가시키기 위해 티켓 안에 있는 스케줄 id랑 같은 스케줄 id를 찾습니다.
      const schedule = await queryRunner.manager.findOne(Schedule, {
        where: { id: ticket.scheduleId },
      });

      schedule.remainSeat += SHOW_TICKETS.COMMON.SEAT.INCREASED;

      await queryRunner.manager.save(Schedule, schedule);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }
}
