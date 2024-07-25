import { IsMilitaryTime } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Show } from './show.entity';

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Column({ type: 'int', name: 'show_id', unsigned: true })
  showId: number;

  /**
   * 공연 날짜
   * @example "2024-07-25"
   */
  @Column({ type: 'date' })
  date: Date;

  /**
   * 공연 시간
   * @example "14:30"
   */
  @Column({ type: 'time' })
  time: string;

  @Column({ type: 'int' })
  remainSeat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [schedules] N : 1 [shows]
  @ManyToOne((type) => Show, (show) => show.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;
}
