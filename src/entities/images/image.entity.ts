import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Show } from '../shows/show.entity';

@Entity({ name: 'images' })
export class Image {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Column({ type: 'int', name: 'show_id', unsigned: true })
  showId: number;

  @Column({ type: 'varchar' })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [images] N : 1 [shows]
  @ManyToOne((type) => Show, (show) => show.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'show_id' })
  show: Show;
}
