import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Trade } from "./trade.entity";

@Entity("trade_logs")
export class TradeLog {
  @PrimaryGeneratedColumn()
  id: number;

  // 중고 거래 엔티티 외래키 설정
  @Column({ name: "trade_id", type: "int", nullable: false })
  tradeId: number;

  @Column({ type: "int" })
  buyerId: number | null;

  @Column({ type: "int", nullable: false })
  sellerId: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relation - [trade_logs] N : 1 [trades]
  @ManyToOne(() => Trade, (trade) => trade.tradeLogs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "trade_id" })
  trade: Trade;
}
