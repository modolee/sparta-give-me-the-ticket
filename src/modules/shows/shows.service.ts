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
import { DeleteBookmarkDto } from './dto/delete-bookmark.dto';
import { format, set, subHours } from 'date-fns';
import { UpdateShowDto } from './dto/update-show.dto';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { GetShowListDto } from './dto/get-show-list.dto';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show) private showRepository: Repository<Show>,
    @InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Schedule) private scheduleRepository: Repository<Schedule>,
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
  async updateShow(showId: number, updateShowDto: UpdateShowDto, req: any) {
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

    // 공연 업데이트
    Object.assign(show, updateShowDto);

    // 스케줄 업데이트
    if (updateShowDto.schedules) {
      // 기존 스케줄 문자열로 변환
      const existingSchedulesMap = new Map(
        show.schedules.map((schedule) => [
          `${new Date(schedule.date).toISOString().split('T')[0]}-${schedule.time}`,
          schedule,
        ])
      );

      // 새로 입력받은 스케줄
      const newSchedules = updateShowDto.schedules;
      console.log('새로운 스케줄:', newSchedules);
      console.log('show: ', show);

      // 기존 스케줄 중 새로운 스케줄에 포함되지 않은 것들을 필터링하여 삭제할 목록을 생성
      const schedulesToDelete = show.schedules.filter((schedule) => {
        const identifier = `${new Date(schedule.date).toISOString().split('T')[0]}-${schedule.time}`;
        return !newSchedules.some(
          (newSchedule) => `${newSchedule.date}-${newSchedule.time}` === identifier
        );
      });

      // 삭제할 스케줄 업데이트
      schedulesToDelete.forEach((schedule) => {
        schedule.deletedAt = new Date();
      });

      // 삭제된 스케줄을 데이터베이스에 저장
      await this.scheduleRepository.save(schedulesToDelete);

      // 새로운 스케줄을 기존 스케줄과 비교
      await Promise.all(
        newSchedules.map(async ({ date, time }) => {
          const identifier = `${date}-${time}`;
          const existingSchedule = existingSchedulesMap.get(identifier);

          if (existingSchedule) {
            // 기존 스케줄 업데이트
            existingSchedule.date = new Date(date);
            existingSchedule.time = time;
            existingSchedule.deletedAt = null;
          } else {
            // 새로운 스케줄 추가
            console.log('새로운 스케줄 추가');
            const newSchedule = this.scheduleRepository.create({
              date: new Date(date),
              time,
              show,
            });
            console.log('showId: ', show.id);
            console.log('newSchedule:', newSchedule);
            await this.scheduleRepository.save(newSchedule);
          }
        })
      );
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
  async deleteShow(showId: number, req: any) {
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

      if (schedule.remainSeat < SHOW_TICKETS.COMMON.SEAT.UNSIGNED) {
        throw new BadRequestException(SHOW_TICKET_MESSAGES.COMMON.SEAT.NOT_ENOUGH);
      }

      const nowTime = new Date();
      console.log('현재 시간:', format(nowTime, 'HH:mm:ss'));

      // 공연 시간을 string에서 Date 객체로 변환 (현재 날짜에 시간만 설정)
      const scheduleTimeString = schedule.time;
      const [hours, minutes] = scheduleTimeString.split(':').map(Number);

      // 현재 날짜에 공연 시간 설정
      const showTime = set(new Date(), { hours, minutes, seconds: 0, milliseconds: 0 });
      console.log('공연 시간:', format(showTime, 'HH:mm:ss'));

      // 공연 시간 기준 2시간 전
      const twoHoursBeforeShowTime = subHours(showTime, 2);
      console.log('공연 시간 기준 2시간 전:', format(twoHoursBeforeShowTime, 'HH:mm:ss'));

      if (nowTime <= twoHoursBeforeShowTime) {
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
