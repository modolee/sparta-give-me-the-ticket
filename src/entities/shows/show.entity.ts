import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShowCategory } from '../../commons/types/shows/show-category.type';
import { User } from '../users/user.entity';
import { Schedule } from './schedule.entity';
import { Image } from '../images/image.entity';
import { Bookmark } from '../users/bookmark.entity';
import { Ticket } from './ticket.entity';
import { Factory } from 'nestjs-seeder';

@Entity({ name: 'shows' })
export class Show {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Factory((faker) => faker.number.int({ min: 1, max: 20 }))
  //유저 엔티티 외래키 설정
  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  /**
   * 공연명
   * @example "시카고"
   */
  @Factory((faker) => faker.lorem.words(3))
  @Column({ type: 'varchar', nullable: false })
  title: string;

  /**
   * 공연 설명
   * @example "브로드웨이 역사상 가장 롱런하고 있는 미국 뮤지컬으로 서울 마지막 공연입니다."
   */
  @Factory((faker) => faker.lorem.words(10))
  @Column({ type: 'text', nullable: false })
  content: string;

  /**
   * 공연 카테고리
   * @example "Musical"
   */
  @Factory((faker) => {
    const categories = Object.values(ShowCategory);
    return faker.helpers.arrayElement(categories);
  })
  @Column({ type: 'enum', enum: ShowCategory, nullable: false })
  category: ShowCategory;

  /**
   * 공연 소요시간
   * @example 200
   */
  @Factory((faker) => faker.number.int({ min: 50, max: 200 }))
  @Column({ type: 'int', nullable: false })
  runtime: number;

  /**
   * 공연 장소
   * @example "서울시 구로구 경인로 662, 디큐브 링크아트센터"
   */
  @Factory((faker) => faker.lorem.words(5))
  @Column({ type: 'varchar', nullable: false })
  location: string;

  /**
   * 공연 금액
   * @example 30000
   */
  @Factory((faker) => faker.number.int({ min: 10000, max: 30000 }))
  @Column({ type: 'int', nullable: false })
  price: number;

  /**
   * 공연 총 좌석 수
   * @example 1800
   */
  @Factory((faker) => faker.number.int({ min: 100, max: 2000 }))
  @Column({ type: 'int', nullable: false })
  totalSeat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [shows] N : 1 [users]
  @ManyToOne((type) => User, (user) => user.shows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  // Relation - [shows] 1 : N [schedules]
  @OneToMany((type) => Schedule, (schedule) => schedule.show, { cascade: true })
  schedules: Schedule[];

  // Relation - [shows] 1 : N [bookmarks]
  @OneToMany((type) => Bookmark, (bookmark) => bookmark.show, { cascade: true })
  bookmarks: Bookmark[];

  // Relation - [shows] 1 : N [images]
  @OneToMany((type) => Image, (image) => image.show, { cascade: true })
  images: Image[];

  // Relation - [shows] 1 : N [tickets]
  @OneToMany((type) => Ticket, (ticket) => ticket.show, { cascade: true })
  tickets: Ticket[];
}
