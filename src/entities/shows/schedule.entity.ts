import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Show } from './show.entity';
import { Factory } from 'nestjs-seeder';
import { randomInt } from 'crypto';
import { Ticket } from './ticket.entity';

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Factory((faker) => faker.number.int({ min: 1, max: 20 }))
  @Column({ type: 'int', name: 'show_id', unsigned: true })
  showId: number;

  /**
   * 공연 날짜
   * @example "2024-09-01"
   */
  @Factory((faker) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + randomInt(50, 100));
    return futureDate;
  })
  @Column({ type: 'date' })
  date: Date;

  /**
   * 공연 시간
   * @example "14:30"
   */
  @Factory((faker) => {
    const hour = randomInt(0, 23).toString().padStart(2, '0');
    const minute = randomInt(0, 59).toString().padStart(2, '0');
    return `${hour}:${minute}`;
  })
  @Column({ type: 'time' })
  time: string;

  @Factory((faker) => faker.number.int({ min: 10000, max: 30000 }))
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

  // Relation - [schedules] 1 : N [tickets]
  @OneToMany((type) => Ticket, (ticket) => ticket.schedule, { cascade: true })
  tickets: Ticket[];
}
