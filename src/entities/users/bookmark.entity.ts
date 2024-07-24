import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Show } from '../shows/show.entity';

@Entity({
  name: 'bookmarks',
})
export class Bookmark {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //유저 엔티티 외래키 설정
  @Column({ name: 'user_id', type: 'int', unsigned: true })
  userId: number;

  //공연 엔티티 외래키 설정
  @Column({ name: 'show_id', type: 'int', unsigned: true })
  showId: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relation - [bookmarks] N : 1 [shows]
  @ManyToOne(() => Show, (show) => show.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;

  // Relation - [bookmarks] N : 1 [users]
  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
