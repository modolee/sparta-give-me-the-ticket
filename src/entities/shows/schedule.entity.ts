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
import { Factory } from 'nestjs-seeder';
import { randomInt } from 'crypto';

@Entity({ name: 'schedules' })
export class Schedule {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Factory(() => randomInt(1, 20))
  @Column({ type: 'int', name: 'show_id', unsigned: true })
  showId: number;

  @Factory((faker) => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + randomInt(50, 100));
    return futureDate;
  })
  @Column({ type: 'date' })
  date: Date;

  @Factory((faker) => {
    const hour = randomInt(0, 23).toString().padStart(2, '0');
    const minute = randomInt(0, 59).toString().padStart(2, '0');
    return `${hour}:${minute}`;
  })
  @Column({ type: 'time' })
  @IsMilitaryTime()
  time: string;

  @Factory(() => randomInt(50, 1000))
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
