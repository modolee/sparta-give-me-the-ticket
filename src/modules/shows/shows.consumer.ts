import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShowsService } from './shows.service';

@Processor('ticketQueue')
export class ShowsConsumer {
  constructor(private readonly showsService: ShowsService) {}

  @Process('ticket')
  async getJoinQueue(job: Job) {
    const { showId, createTicketDto, user } = job.data;
    const ticket = await this.showsService.createTicket(showId, createTicketDto, user);
    return ticket;
  }
}
