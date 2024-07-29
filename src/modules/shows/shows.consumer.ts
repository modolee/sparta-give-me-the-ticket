import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShowsService } from './shows.service';

@Processor('ticketQueue')
export class ShowsConsumer {
  constructor(private readonly showsService: ShowsService) {}

  @Process('ticket')
  async getJoinQueue(job: Job) {
    await this.showsService.createTicket(job.data.showId, job.data.user, job.data.createTicketDto);
  }
}
