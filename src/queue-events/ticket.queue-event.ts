import { QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { TICKET_QUEUE } from 'src/commons/constants/queue.constant';

@QueueEventsListener(TICKET_QUEUE)
export class TicketQueueEvents extends QueueEventsHost {}
