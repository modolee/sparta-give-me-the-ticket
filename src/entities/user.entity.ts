import { IsNotEmpty, IsStrongPassword } from "class-validator";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { USER_MESSAGES } from "src/constants/user-message.constant";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @IsNotEmpty({ message: USER_MESSAGES.USER.SIGNUP.EMAIL.EMPTY })
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @IsNotEmpty({ message: USER_MESSAGES.USER.SIGNUP.NICKNAME.EMPTY })
  @Column({ unique: true })
  nickname: string;

  @IsNotEmpty({ message: USER_MESSAGES.USER.SIGNUP.PASSWORD.EMPTY })
  @IsStrongPassword({ minLength: 8, minSymbols: 1 }, {})
  @Column({ select: false })
  password: string;

  @IsNotEmpty()
  @Column({ default: 1000000 })
  point: number;

  @Column()
  profileImg: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [users] 1 : N [point_logs]
  @OneToMany(() => PointLog, (pointLog) => pointLog.user, { cascade: true })
  pointLogs: PointLog[];

  // Relation - [users] 1 : N [bookmarks]
  @OneToMany(() => Bookmark, (bookmark) => bookmark.user, { cascade: true })
  bookmarks: Bookmark[];

  // Relation - [users] 1 : N [shows]
  @OneToMany(() => Show, (show) => show.user, { cascade: true })
  shows: Show[];

  // Relation - [users] 1 : N [tickets]
  @OneToMany(() => Ticket, (ticket) => ticket.user, { cascade: true })
  tickets: Ticket[];

  // Relation - [users] 1 : N [trades]
  @OneToMany(() => Trades, (trade) => trade.user, { cascade: true })
  trades: Trades[];
}
