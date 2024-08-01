import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUES } from '../../commons/constants/queue.constant';
import { TradesService } from '../trades/trades.service';

@Processor(QUEUES.TRADE_QUEUE)
export class TicketProcessor extends WorkerHost {
  constructor(private readonly tradeService: TradesService) {
    super();
  }
  async process(job: Job<{ tradeId: number; buyerId: number }>): Promise<any> {
    return await this.tradeService.createTicket(job.data.tradeId, job.data.buyerId);
  }
}
