import { Worker, Queue, RedisConnection } from 'bullmq';
import { Job } from 'bullmq';
import { QUEUES } from 'src/commons/constants/queue.constant';
import { TradesService } from './trades.service';

export class tradeQueue {
  constructor(private readonly tradeService: TradesService) {}

  async process(job: Job<{ tradeId: number; buyerId: number }>) {
    return new Worker(QUEUES.TRADE_QUEUE, async (job) => {
      return await this.tradeService.createTicket(job.data.tradeId, job.data.buyerId);
    });
  }
}

//nestjs의 문법에 맞지 않기에 폐기할 예정
