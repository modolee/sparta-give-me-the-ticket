import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { PointLog } from './point-log.entity';
import { Bookmark } from './bookmark.entity';
import { Show } from '../shows/show.entity';
import { Ticket } from '../shows/ticket.entity';
import { Trade } from '../trades/trade.entity';
import { Role } from 'src/commons/types/users/user-role.type';
import { USER_CONSTANT } from 'src/commons/constants/users/user.constant';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { Factory } from 'nestjs-seeder';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  /**
   * 이메일
   * @example "modify@sample.com"
   */
  @Factory((faker) => faker.internet.email())
  @IsNotEmpty({ message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.EMAIL.EMPTY })
  @IsEmail()
  @Column({ type: 'varchar', unique: true })
  email: string;

  /**
   * 닉네임
   * @example "Charlie"
   */
  @Factory((faker) => faker.internet.userName())
  @IsNotEmpty({ message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.NICKNAME.EMPTY })
  @Column({ type: 'varchar', unique: true })
  nickname: string;

  /**
   * 비밀번호
   * @example "Test1234!"
   */
  @Factory((faker) => faker.internet.password({ length: 10 }))
  @IsNotEmpty({ message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.EMPTY })
  @IsStrongPassword(
    {
      minLength: USER_CONSTANT.PASSWORD.MIN_LENGTH,
      minSymbols: USER_CONSTANT.PASSWORD.MIN_SYMBOLS,
    },
    { message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.WEAK }
  )
  @Column({ type: 'varchar', select: false })
  password: string;

  @Factory((faker) => faker.finance.ethereumAddress())
  @Column({ type: 'varchar' })
  refreshToken: string;

  @Factory((faker) =>
    faker.number.int({ min: USER_CONSTANT.POINT.DEFAULT, max: USER_CONSTANT.POINT.DEFAULT })
  )
  @IsNotEmpty()
  @Column({ type: 'int', default: USER_CONSTANT.POINT.DEFAULT })
  point: number;

  /**
   * 프로필 이미지
   * @example "https://example.com/profile.jpg"
   */
  @Factory((faker) => faker.image.url())
  @Column({ type: 'varchar' })
  profileImg: string;

  @Factory((faker) => {
    const categories = Object.values(Role);
    return faker.helpers.arrayElement(categories);
  })
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

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
  @OneToMany(() => Trade, (trade) => trade.user, { cascade: true })
  trades: Trade[];
}
