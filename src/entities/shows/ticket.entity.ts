import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Show } from './show.entity';
import { Trade } from '../trades/trade.entity';
import { TicketStatus } from '../../commons/types/shows/ticket.type';
import { IsMilitaryTime } from 'class-validator';
import { Schedule } from './schedule.entity';
import { SHOW_TICKETS } from 'src/commons/constants/shows/show-tickets.constant';

@Entity({
  name: 'tickets',
})
@Index([SHOW_TICKETS.COMMON.INDEX.USER, SHOW_TICKETS.COMMON.INDEX.SHOW])
export class Ticket {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 유저 엔티티 외래키 설정
  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  // 공연 엔티티 외래키 설정
  @Column({ name: 'show_id', type: 'int', unsigned: true })
  showId: number;

  // 스케줄 엔티티 외래키 설정
  @Column({ name: 'schedule_id', type: 'int', unsigned: true })
  scheduleId: number;

  @Column({ type: 'varchar' })
  nickname: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'time' })
  @IsMilitaryTime()
  time: string;

  @Column({ type: 'int' })
  runtime: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'varchar' })
  location: string;

  // 원가
  @Column({ type: 'int' })
  price: number;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.USEABLE,
  })
  status: TicketStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [tickets] 1 : N [trades]
  @OneToMany(() => Trade, (trade) => trade.ticket, { cascade: true })
  trades: Trade[];

  // Relation - [tickets] N : 1 [shows]
  @ManyToOne(() => Show, (show) => show.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  // Relation - [tickets] N : 1 [users]
  @ManyToOne(() => User, (user) => user.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Relation - [schedules] N : 1 [shows]
  @ManyToOne(() => Schedule, (schedule) => schedule.tickets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;
}
