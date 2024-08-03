import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Cron } from '@nestjs/schedule';
import { Show } from 'src/entities/shows/show.entity';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
@Injectable()
export class SearchService {
  private readonly indexName = 'shows';

  constructor(
    private readonly eService: ElasticsearchService,
    @InjectRepository(Show) private readonly showRepository: Repository<Show>
  ) {}

  // 모듈이 초기화 될 때 인덱스 생성 및 모든 show 동기화
  async onModuleInit() {
    await this.createIndex();
    await this.syncAllShows();
  }

  // Elasticsearch 인덱스 생성
  private async createIndex() {
    try {
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
                    min_gram: 1,
                    max_gram: 5,
                    token_chars: ['letter', 'digit', 'whitespace'],
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
                id: { type: 'integer' },
              },
            },
          },
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  // show 데이터 인덱싱
  private async indexShowData(show: Show) {
    try {
      await this.eService.index({
        index: this.indexName,
        id: show.id.toString(),
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
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  // show 동기화 (스케줄링)
  private async syncAllShows() {
    try {
      // 삭제된 show를 가져와서 인덱스에서 삭제
      const [deletedShows, allShows] = await Promise.all([
        this.showRepository.find({ where: { deletedAt: MoreThan(new Date(0)) } }),
        this.showRepository.find({ where: { deletedAt: null } }),
      ]);

      await Promise.all([
        ...deletedShows.map((show) => this.deleteShowIndex(show.id)),
        ...allShows.map((show) => this.indexShowData(show)),
      ]);
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  @Cron('* * * * *') // 1분마다 동기화
  async handleCron() {
    await this.syncAllShows();
  }

  // show 생성 시 인덱스에 추가
  async createShowIndex(show: Show) {
    await this.indexShowData(show);
  }

  // show 검색 기능
  async searchShows(category: string, search: string, page: number, limit: number) {
    const mustQueries = [];

    if (category) {
      mustQueries.push({ match: { category } });
    }

    if (search) {
      mustQueries.push({
        query_string: {
          query: `*${search.replace(/ /g, '*')}*`,
          fields: ['title'],
          analyze_wildcard: true,
          default_operator: 'AND',
        },
      });
    }

    const queryBody: any = {
      query: {
        bool: {
          must: mustQueries,
        },
      },
      from: (page - 1) * limit,
      size: limit,
      sort: [{ id: { order: 'desc' } }],
    };

    try {
      const result = await this.eService.search({
        index: this.indexName,
        body: queryBody,
      });
      const hits = result.body.hits.hits;
      const results = hits.map((item) => item._source);
      const totalHits =
        typeof result.body.hits.total === 'number'
          ? result.body.hits.total
          : result.body.hits.total.value;

      return { results, total: totalHits };
    } catch (error) {
      console.error('Search error:', error);
      return { results: [], total: 0 };
    }
  }

  // show 삭제 시 인덱스에서 삭제
  async deleteShowIndex(showId: number) {
    try {
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
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.DELETE.FAIL);
    }
  }
}
