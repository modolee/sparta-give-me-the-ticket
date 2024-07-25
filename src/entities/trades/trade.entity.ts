import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Ticket } from '../shows/ticket.entity';
import { User } from '../users/user.entity';
import { TradeLog } from './trade-log.entity';
import { FLAG } from 'src/commons/types/flag/flag-type';

@Entity('trades')
export class Trade {
  @PrimaryGeneratedColumn()
  id: number;

  // 유저 엔티티 외래키 설정
  @Column({ name: 'seller_id', type: 'int', nullable: false, unsigned: true })
  sellerId: number;

  // 티켓 엔티티 외래키 설정
  @Column({ name: 'ticket_id', type: 'int', nullable: false, unsigned: true })
  ticketId: number;

  @Column({ type: 'int', nullable: false })
  showId: number;

  @Column({ type: 'int', nullable: false })
  price: number;

  @Column({ nullable: false })
  closedAt: Date;

  @Column({ type: 'enum', enum: FLAG, nullable: false, default: FLAG.ACTIVATION })
  flag: FLAG;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [trades] 1 : N [trade_logs]
  @OneToMany(() => TradeLog, (tradeLog) => tradeLog.trade, { cascade: true })
  tradeLogs: TradeLog[];

  // Relation - [trades] N : 1 [tickets]
  @ManyToOne(() => Ticket, (ticket) => ticket.trades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ticket_id' })
  ticket: Ticket;

  // Relation - [trades] N : 1 [users]
  @ManyToOne(() => User, (user) => user.trades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seller_id' })
  user: User;
}
