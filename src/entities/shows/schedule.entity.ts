import { Show } from "./shows/show.entity";

@Entity({ name: "schedules" })
export class Schedule {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  //공연 엔티티 외래키 설정
  @Column({ type: "int", name: "show_id", unsigned: true })
  showId: number;

  @Column({ type: "date" })
  date: Date;

  @Column({ type: "time" })
  @IsMilitaryTime()
  time: string;

  @Column({ type: "int" })
  remainSeat: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  // Relation - [schedules] N : 1 [shows]
  @ManytoOne((type) => Show, (show) => show.schedules, { onDelete: "CASCADE" })
  @JoinColumn({ name: "show_id" })
  show: Show;
}
