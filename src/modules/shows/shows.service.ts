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
import { addHours, format, isAfter, isBefore, parse, set, subDays, subHours } from 'date-fns';
import { UpdateShowDto } from './dto/update-show.dto';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { GetShowListDto } from './dto/get-show-list.dto';
import { CreateTicketDto } from './dto/create-ticket-dto';
import { Schedule } from 'src/entities/shows/schedule.entity';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show) private showRepository: Repository<Show>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
    private dataSource: DataSource
  ) {}

  /*공연 생성 */
  async createShow(createShowDto: CreateShowDto, userId: number) {
    const { schedules, ...restOfShow } = createShowDto;

    //공연 명 기준으로 이미 있는 공연인지 확인
    const existedShow = await this.showRepository.findOneBy({
      title: createShowDto.title,
    });

    if (existedShow) {
      throw new ConflictException(SHOW_MESSAGES.COMMON.TITLE.EXISTED);
    }

    //사용자 정보 가져오기
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER.COMMON.NOT_FOUND);
    }

    //공연 생성
    const show = await this.showRepository.create({
      ...restOfShow,
      userId: user.id,
      schedules: schedules.map((schedule) => ({
        ...schedule,
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

  /*공연 목록 조회 */
  async getShowList({ category, search }: GetShowListDto) {
    const shows = await this.showRepository.find({
      where: {
        ...(category && { category }),
        ...(search && { title: Like(`%${search}%`) }),
      },
    });
    return {
      status: HttpStatus.CREATED,
      message: SHOW_MESSAGES.GET_LIST.SUCCEED.LIST,
      data: shows,
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
  async updateShow(showId: number, updateShowDto: UpdateShowDto, user: User) {
    const show = await this.showRepository.findOne({
      where: { id: showId },
      relations: { schedules: true },
    });

    //공연 존재 여부 확인
    if (!show) {
      throw new NotFoundException(SHOW_MESSAGES.COMMON.NOT_FOUND);
    }

    //요청 바디가 비어있는지 확인
    if (Object.keys(updateShowDto).length === 0) {
      throw new BadRequestException(SHOW_MESSAGES.UPDATE.NO_BODY_DATE);
    }

    // 공연 업데이트
    Object.assign(show, updateShowDto);

    // 스케줄 업데이트
    if (updateShowDto.schedules) {
      // 스케줄 문자열로 변환
      const existingSchedulesMap = new Map(
        show.schedules.map((schedule) => [
          `${schedule.date.toISOString().split('T')[0]}-${schedule.time}`,
          schedule,
        ])
      );

      //새로운 스케줄
      const newSchedules = updateShowDto.schedules;

      //새로운 스케줄을 기존 스케줄 업데이트 또는 추가
      for (const { date, time } of newSchedules) {
        const identifier = `${date}-${time}`;
        const existingSchedule = existingSchedulesMap.get(identifier);

        if (existingSchedule) {
          // 기존 스케줄 업데이트
          existingSchedule.date = new Date(date);
          existingSchedule.time = time;
        } else {
          //새로운 스케줄 추가
          const newSchedule = this.scheduleRepository.create({
            date: new Date(date),
            time,
            show, //공연이랑 연결
          });
          show.schedules.push(newSchedule);
        }
      }
    }

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
    return;
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
  async createTicket(
    showId: number,
    createTicketDto: CreateTicketDto,
    scheduleId: number,
    user: User
  ) {
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
        where: { id: scheduleId },
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

  /*티켓 환불 */
  async refundTicket(showId: number, ticketId: number, scheduleId: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schedule = await queryRunner.manager.findOneBy(Schedule, { id: scheduleId });

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

      const showTime = `${String(ticket.date)}T${String(ticket.time)}`;
      console.log(showTime);

      // 현재의 시간에서 1시간 전으로 시간 제한을 설정
      const oneHoursBeforeShowTime = subHours(showTime, 1);
      const nowTime = new Date();

      // 공연 시간이 현재 시간 기준으로 1시간 이전일 경우 환불하기 어렵다는 메시지 전달
      if (nowTime >= oneHoursBeforeShowTime) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.EXPIRED);
      }

      // 현재 시간 가져오기

      // 티켓 예매 시점 확인 (티켓의 생성 시점)
      const bookingTime = new Date(ticket.createdAt);
      // 공연 시작 3일 전, 10일 전 시간 계산
      const threeDaysBeforeShow = subDays(showTime, 3);
      const tenDaysBeforeShow = subDays(showTime, 10);

      // 환불 정책에 따른 비율 계산
      let refundPoint = SHOW_TICKETS.COMMON.REFUND_POINT;

      // 예매 시점이 공연 시작 3일 전까지인지 확인
      if (bookingTime > threeDaysBeforeShow) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.NOT_ALLOWED);
      }

      // 환불 가능 여부와 비율 결정

      // 1시간 전이면 10퍼센트 환불
      if (nowTime > oneHoursBeforeShowTime) {
        refundPoint = ticket.price * SHOW_TICKETS.COMMON.TICKET.PERCENT.TEN;
      }
      // 공연 시작 3일 전까지 50% 환불
      else if (nowTime > threeDaysBeforeShow) {
        refundPoint = ticket.price * SHOW_TICKETS.COMMON.TICKET.PERCENT.FIFTY;
      }
      // 공연 시작 10일 전까지 전액 환불
      else if (isBefore(nowTime, tenDaysBeforeShow)) {
        refundPoint = ticket.price;
      }
      // 공연 예매 후 24시간 이내 전액 환불
      else if (isAfter(nowTime, addHours(bookingTime, 24))) {
        refundPoint = ticket.price;
      } else {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.NOT_ALLOWED);
      }

      // 티켓 상태를 환불로 업데이트를 합니다.
      ticket.status = TicketStatus.REFUNDED;
      await queryRunner.manager.save(Ticket, ticket);

      user.point += refundPoint;

      await queryRunner.manager.save(User, user);

      let refundSeat = schedule.remainSeat;
      // 좌석 증가 처리
      refundSeat += SHOW_TICKETS.COMMON.SEAT.INCREASED;
      console.log(schedule.remainSeat);

      await queryRunner.manager.save(Schedule, schedule);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    }
  }
}
