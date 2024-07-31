import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShowsService } from './shows.service';

@Processor('ticketQueue')
export class QueueConsumer {
  constructor(private readonly showsService: ShowsService) {}

  @Process('ticket')
  async getJoinQueue(job: Job) {
    return await this.showsService.createTicket(
      job.data.showId,
      job.data.createTicketDto,
      job.data.user,
      job.data.eventName
    );
  }
}
