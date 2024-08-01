import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DataSource } from 'typeorm';
import { Ticket } from 'src/entities/shows/ticket.entity';

@Processor('tradeQueue')
export class TicketProcessor {
  constructor(private dataSource: DataSource) {}

  //   @Process('reserveTicket')
  //   async handlerReserveTicket(job: Job<{ userId: number; ticketId: number }>) {}
}
