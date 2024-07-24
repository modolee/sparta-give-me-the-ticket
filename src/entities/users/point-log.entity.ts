import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PointType } from 'src/commons/types/users/point.type';

@Entity('point_logs')
export class PointLog {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 유저 엔티티 외래키 설정
  @Column({ name: 'user_id', unsigned: true })
  userId: number;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column({ default: 'DEPOSIT' })
  type: PointType;

  @CreateDateColumn()
  createdAt: Date;

  // Relation - [point_logs] N : 1 [users]
  @ManyToOne(() => User, (user) => user.pointLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
