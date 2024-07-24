import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
import { Ticket } from 'src/entities/shows/ticket.entity';
import { Bookmark } from 'src/entities/users/bookmark.entity';
import { User } from 'src/entities/users/user.entity';
import { Repository } from 'typeorm';
import { CreateShowDto } from './dto/create-show.dto';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show) private showRepository: Repository<Show>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    @InjectRepository(Bookmark) private bookmarkRepository: Repository<Bookmark>
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
    //찜할 공연을 찾습니다.
    const show = await this.showRepository.findOne({ where: { id: showId } });
    if (!show) {
      throw new NotFoundException('공연이 존재하지 않습니다.');
    }
    const bookmark = await this.bookmarkRepository.create({
      userId: user.id,
      showId: show.id,
    });
    if (bookmark) {
      throw new Error('이미 찜한 공연입니다.');
    }

    await this.bookmarkRepository.save(bookmark);

    return;
  }

  /*공연 찜하기 취소 */
  async deleteBookmark(showId: number) {
    return;
  }

  /*티켓 예매 */
  async createTicket(showId: number) {
    return;
  }

  /*티켓 환불 */
  async refundTicket(showId: number, ticketId: number) {
    return;
  }
}
