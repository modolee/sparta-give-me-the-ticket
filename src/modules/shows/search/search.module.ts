import { ElasticsearchModule } from '@nestjs/elasticsearch';
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
        requestTimeout: configService.get<number>('ELASTIC_REQUEST_TIMEOUT'),
        pingTimeout: configService.get<number>('ELASTIC_PING_TIMEOUT'),
        auth: {
          username: configService.get<string>('ELASTIC_USERNAME'),
          password: configService.get<string>('ELASTIC_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
