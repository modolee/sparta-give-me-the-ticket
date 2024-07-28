import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTIC_NODE'),
        maxRetries: configService.get<number>('ELASTIC_MAX_RETRIES'),
        requestTimeout: configService.get<number>('ELASTIC_REQUEST_TIME_OUT'),
        pingTimeout: configService.get<number>('ELASTIC_PING_TIME_OUT'),
        headersTimeout: configService.get<number>('ELASTIC_HEADERS_TIMEOUT'),
        sniffOnStart: configService.get<boolean>('ELASTIC_SNIFF_ON_START'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
