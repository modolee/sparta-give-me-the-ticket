import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ShowsService } from './shows.service';
import { QUEUES } from 'src/commons/constants/queue.constant';

//대기열에 넣은 걸 차례대로 꺼내는 consumer 로직
@Processor(QUEUES.TICKET_QUEUE)
export class ShowsConsumer extends WorkerHost {
  constructor(private readonly showsService: ShowsService) {
    super();
  }
  async process(job: Job): Promise<any> {
    return await this.showsService.createTicket(
      job.data.showId,
      job.data.createTicketDto,
      job.data.user
    );
  }
}
