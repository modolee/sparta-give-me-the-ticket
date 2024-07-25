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
import { ShowCategory } from 'src/commons/types/shows/show-category.type';
import { User } from '../users/user.entity';
import { Schedule } from './schedule.entity';
import { Image } from '../images/image.entity';
import { Bookmark } from '../users/bookmark.entity';
import { Ticket } from './ticket.entity';

@Entity({ name: 'shows' })
export class Show {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //유저 엔티티 외래키 설정
  @Column({ type: 'int', name: 'user_id', unsigned: true })
  userId: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'enum', enum: ShowCategory, nullable: false })
  category: ShowCategory;

  @Column({ type: 'int', nullable: false })
  runtime: number;

  @Column({ type: 'varchar', nullable: false })
  location: string;

  @Column({ type: 'int', nullable: false })
  price: number;

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
  @JoinColumn({ name: 'user_id' })
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
