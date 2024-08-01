import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { Show } from 'src/entities/shows/show.entity';

@Injectable()
export class SearchService {
  private readonly indexName = 'shows';
  constructor(private readonly eService: ElasticsearchService) {}

  async onModuleInit() {
    await this.createIndex();
  }

  private async createIndex() {
    const indexExists = await this.eService.indices.exists({ index: this.indexName });

    if (!indexExists.body) {
      await this.eService.indices.create({
        index: this.indexName,
        body: {
          settings: {
            analysis: {
              tokenizer: {
                ngram_tokenizer: {
                  type: 'ngram',
                },
              },
              analyzer: {
                ngram_analyzer: {
                  type: 'custom',
                  tokenizer: 'ngram_tokenizer',
                  filter: ['lowercase'],
                },
              },
            },
          },
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'ngram_analyzer',
                search_analyzer: 'ngram_analyzer',
              },
              category: { type: 'keyword' },
            },
          },
        },
      });
    }
  }

  // 공연 생성 시 인덱싱
  async createShowIndex(show: Show) {
    await this.eService.index({
      index: this.indexName,
      body: {
        id: show.id,
        userId: show.userId,
        title: show.title,
        content: show.content,
        category: show.category,
        runtime: show.runtime,
        location: show.location,
        price: show.price,
        totalSeat: show.totalSeat,
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
      },
    });
  }

  // 공연 목록 검색
  async searchShows(category: string, search: string, page: number, limit: number) {
    const mustQueries = [];

    // 카데고리가 있다면 mustQueries에 추가
    if (category) {
      mustQueries.push({ match: { category } });
    }

    // 검색어가 있다면 mustQueries에 추가
    if (search) {
      mustQueries.push({
        match: {
          title: {
            query: search,
            analyzer: 'ngram_analyzer',
            fuzziness: 'AUTO',
          },
        },
      });
    }

    // elasticsearch 검색
    const queryBody = {
      query: {
        bool: {
          must: mustQueries,
        },
      },
      from: (page - 1) * limit,
      size: limit,
    };

    try {
      const result = await this.eService.search({
        index: this.indexName,
        body: queryBody,
      });

      // 검색 결과에서 히트된 문서 가져오기
      const hits = result.body.hits.hits;
      // 각 문서의 source 부분을 결과 리스트로 변환
      const results = hits.map((item) => item._source);

      // 총 히트 수 확인
      const totalHits =
        typeof result.body.hits.total === 'number'
          ? result.body.hits.total
          : result.body.hits.total.value;

      // 검색 결과와 총 히트 수 반환
      return { results, total: totalHits };
    } catch (error) {
      console.error('Elasticsearch Error:', error.meta.body.error);
      throw new InternalServerErrorException(SHOW_MESSAGES.GET_LIST.FAIL);
    }
  }

  // 공연 삭제 시 인덱싱
  async deleteShowIndex(showId: number) {
    await this.eService.deleteByQuery({
      index: this.indexName,
      body: {
        query: {
          match: {
            id: showId,
          },
        },
      },
    });
  }
}
