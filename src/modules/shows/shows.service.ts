import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { User } from 'src/entities/users/user.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateShowDto } from './dto/create-show.dto';
import { USER_BOOKMARK_MESSAGES } from 'src/commons/constants/users/user-bookmark-messages.constant';
import { SHOW_TICKET_MESSAGES } from 'src/commons/constants/shows/show-ticket-messages.constant';
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
  async createShow(createShowDto: CreateShowDto) {
    return;
  }

  /*공연 목록 조회 */
  async getShowList(category: string, title: string) {
    return;
  }

  /*공연 상세 조회 */
  async getShow(showId: number) {
    return;
  }

  /*공연 수정 */
  async updateShow(showId: number) {
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
  async createTicket(showId: number, user: User, scheduleId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 공연이 있는지 확인합니다.
      const show = await queryRunner.manager.findOne(Show, {
        where: { id: showId },
      });
      if (!show) {
        throw new NotFoundException(SHOW_TICKET_MESSAGES.COMMON.TICKET.SHOW_NOT_FOUND);
      }

      // 스케줄이 있는지 확인합니다.
      const schedule = await queryRunner.manager.findOne(Schedule, {
        where: { id: scheduleId, show: { id: showId } },
      });
      if (!schedule) {
        throw new NotFoundException('해당 스케줄을 찾을 수 없습니다.');
      }

      if (user.point < show.price) {
        throw new BadRequestException('포인트가 부족합니다.');
      }

      // 현재의 시간에서 2시간 전으로 시간 제한을 설정
      const twoHoursBefore = new Date();
      twoHoursBefore.setHours(twoHoursBefore.getHours() - 2);

      // 공연 시간이 2시간 이전일 경우 티켓을 구매하기 어렵다는 메시지 전달
      if (schedule.date < twoHoursBefore) {
        throw new BadRequestException('해당 공연 시간 2시간 전부터는 티켓을 구매할 수 없습니다.');
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
      schedule.remainSeat -= 1;

      if (schedule.remainSeat < 0) {
        throw new BadRequestException('예약 가능한 좌석이 없습니다.');
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
  async refundTicket(showId: number, ticketId: number) {
    return;
  }
}
