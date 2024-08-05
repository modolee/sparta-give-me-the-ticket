import { QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { QUEUES } from 'src/commons/constants/queue.constant';

//대기시간 설정
@QueueEventsListener(QUEUES.TRADE_QUEUE)
export class TicketQueueEvents extends QueueEventsHost {
  async handleQueueActive(job: any): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, job.data.seconds * 1000));
  }
}
