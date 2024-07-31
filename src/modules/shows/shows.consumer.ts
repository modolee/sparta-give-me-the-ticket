import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ShowsService } from './shows.service';

@Processor('ticketQueue')
export class QueueConsumer extends WorkerHost {
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
