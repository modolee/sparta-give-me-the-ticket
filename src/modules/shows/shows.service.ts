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
import { Schedule } from 'src/entities/shows/schedule.entity';
import { SHOW_TICKETS } from 'src/commons/constants/shows/show-tickets.constant';
import { TicketStatus } from 'src/commons/types/shows/ticket.type';
import { UpdateShowDto } from './dto/update-show.dto';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { GetShowListDto } from './dto/get-show-list.dto';

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
      message: SHOW_MESSAGES.GET_LIST.SUCCEED,
      data: shows,
    };
  }

  /*공연 상세 조회 */
  async getShow(showId: number) {
    return;
  }

  /*공연 수정 */
  async updateShow(showId: number, updateShowDot: UpdateShowDto) {
    return;
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

    // 이미 찜했을 경우에 에러 메시지를 발생합니다.
    const bookmark = await this.bookmarkRepository.findOne({
      where: { showId: show.id, userId: user.id },
    });
    if (bookmark) {
      throw new ConflictException(USER_BOOKMARK_MESSAGES.COMMON.BOOKMARK.ALREADY_EXISTS);
    }

    // 찜하기를 하지 않았을 경우에 새로운 찜하기를 생성합니다.
    const newBookmark = this.bookmarkRepository.create({
      userId: user.id,
      showId: show.id,
    });
    await this.bookmarkRepository.save(newBookmark);

    return newBookmark;
  }

  /*공연 찜하기 취소 */
  async deleteBookmark(bookmarkId: number, showId: number) {
    // 본인이 찜한 공연이 있는지 확인합니다.
    const bookmark = await this.bookmarkRepository.findOne({
      where: { id: bookmarkId, showId },
    });
    if (!bookmark) {
      throw new NotFoundException(USER_BOOKMARK_MESSAGES.COMMON.CANCEL_BOOKMARK.NOT_FOUND);
    }
    // 찜하기를 취소합니다. (hard delete)
    await this.bookmarkRepository.delete(bookmark);

    return bookmark;
  }
  /* 티켓 예매 */
  async createTicket(showId: number, scheduleId: number, user: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 공연이 있는지 확인합니다.
      const show = await queryRunner.manager.findOne(Show, {
        where: { id: showId },
      });
      if (!show) {
        throw new NotFoundException(SHOW_TICKET_MESSAGES.COMMON.SHOW.NOT_FOUND);
      }

      // 스케줄이 있는지 확인합니다.
      const schedule = await queryRunner.manager.findOne(Schedule, {
        where: { id: scheduleId, showId },
      });
      if (!schedule) {
        throw new NotFoundException(SHOW_TICKET_MESSAGES.COMMON.SHOW.NOT_FOUND);
      }

      // 현재의 시간에서 2시간 전으로 시간 제한을 설정
      const twoHoursBefore = new Date();
      twoHoursBefore.setHours(twoHoursBefore.getHours() - SHOW_TICKETS.COMMON.SHOW.HOURS);

      // string 형식인 time을 Date 객체로 변환
      const showTime = new Date(schedule.time);

      // 공연 시간이 2시간 이전일 경우 티켓을 구매하기 어렵다는 메시지 전달
      if (showTime < twoHoursBefore) {
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
        runtime: show.runtime,
        date: schedule.date,
        location: show.location,
        price: show.price,
      });

      await queryRunner.manager.save(Ticket, ticket);

      // 좌석 차감 처리
      schedule.remainSeat -= SHOW_TICKETS.COMMON.SEAT.DEDUCTED;

      if (schedule.remainSeat < SHOW_TICKETS.COMMON.SEAT.UNSIGNED) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.SEAT.NOT_ENOUGH);
      }

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
  async refundTicket(showId: number, ticketId: number, schedule: Schedule, user: User) {
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

      // 현재의 시간에서 1시간 전으로 시간 제한을 설정
      const oneHoursBefore = new Date();
      oneHoursBefore.setHours(oneHoursBefore.getHours() - SHOW_TICKETS.COMMON.TICKET.HOURS);

      const showTime = new Date(schedule.time);

      // 공연 시간이 1시간 이전일 경우 환불하기 어렵다는 메시지 전달
      if (showTime < oneHoursBefore) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.EXPIRED);
      }

      // 현재 시간 가져오기
      const nowTime = new Date();

      // 티켓 예매 시점 확인 (티켓의 생성 시점)
      const bookingTime = new Date(ticket.createdAt);
      // 공연 시작 3일 전 시간 계산 및 3일을 밀리초로 변환
      const threeDaysBeforeShow = new Date(showTime.getTime() - 3 * 24 * 60 * 60 * 1000);

      // 환불 정책에 따른 비율 계산
      let refundPoint = SHOW_TICKETS.COMMON.REFUND_POINT;

      // 예매 시점이 공연 시작 3일 전까지인지 확인
      if (bookingTime > threeDaysBeforeShow) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.REFUND.NOT_ALLOWED);
      }

      // 환불 가능 여부와 비율 결정
      const timeDiff = showTime.getTime() - nowTime.getTime();
      const hoursUntilShow = Math.ceil(timeDiff / (1000 * 60 * 60));

      if (hoursUntilShow <= SHOW_TICKETS.COMMON.TICKET.PRICE.ONE_HOURS) {
        refundPoint = ticket.price * SHOW_TICKETS.COMMON.TICKET.PERCENT.TEN; // 공연 시작 1시간 전까지 10% 환불
      } else if (hoursUntilShow <= SHOW_TICKETS.COMMON.TICKET.PRICE.THREE_DAYS) {
        refundPoint = ticket.price * SHOW_TICKETS.COMMON.TICKET.PERCENT.FIFTY; // 공연 시작 3일 전까지 50% 환불
      } else if (hoursUntilShow <= SHOW_TICKETS.COMMON.TICKET.PRICE.TEN_DAYS) {
        refundPoint = ticket.price; // 공연 시작 10일 전까지 전액 환불
      } else {
        refundPoint = ticket.price; // 공연 예매 후 24시간 이내 전액 환불
      }

      // 티켓 상태를 환불로 업데이트를 합니다.
      ticket.status = TicketStatus.REFUNDED;
      await queryRunner.manager.save(Ticket, ticket);

      user.point += refundPoint;
      await queryRunner.manager.save(User, user);

      // 좌석 증가 처리
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
