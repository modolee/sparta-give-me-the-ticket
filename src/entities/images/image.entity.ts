import { Show } from "./show.entity";

@Entity({ name: "images" })
export class Image {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Column({ type: "int", name: "show_id", unsigned: true })
  showId: number;

  @Column({ type: "text" })
  imageUrl: text[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [images] N : 1 [shows]
  @ManytoOne((type) => Show, (show) => show.images, { onDelete: "CASCADE" })
  @JoinColumn({ name: "show_id" })
  show: Show;
}
