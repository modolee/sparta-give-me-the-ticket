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
} from "typeorm";
import { User } from "./user.entity";
import { Show } from "./shows/show.entity";
import { Trade } from "./trade.entity";

@Entity({
  name: "tickets",
})
export class Ticket {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  // 유저 엔티티 외래키 설정
  @Column({ name: "user_id", type: "int", nullable: false })
  userId: number;

  // 공연 엔티티 외래키 설정
  @Column({ name: "show_id", type: "int", nullable: false })
  showId: number;

  @Column({ type: "varchar", nullable: false })
  nickname: string;

  @Column({ type: "varchar", nullable: false })
  title: string;

  @Column({ type: "int", nullable: false })
  runtime: number;

  @Column({ type: "date", nullable: false })
  date: Date;

  @Column({ type: "varchar", nullable: false })
  location: string;

  // 자유석 기준 가격
  @Column({ type: "int", nullable: false })
  price: number;

  @Column({
    type: "enum",
    enum: Status,
    default: Status.USEABLE,
  })
  status: Status;

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
  @ManyToOne(() => Show, (show) => show.tickets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "show_id" })
  show: Show;

  // Relation - [tickets] N : 1 [users]
  @ManyToOne(() => User, (user) => user.tickets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;
}
