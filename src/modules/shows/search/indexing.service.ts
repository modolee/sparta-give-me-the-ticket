import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchService } from './search.service';

@Injectable()
export class IndexingService {
  constructor(private readonly searchService: SearchService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      await this.searchService.reindexShows();
      console.log('정기 인덱싱 완료');
    } catch (error) {
      console.error('정기 인덱싱 오류:', error);
    }
  }
}
