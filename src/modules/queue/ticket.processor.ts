import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { DataSource } from 'typeorm';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Processor('ticketQueue')
export class TicketProcessor {
  constructor(private dataSource: DataSource) {}

  @Process('reserveTicket')
  async handlerReserveTicket(job: Job<{ userId: number; ticketId: number }>) {}
}
