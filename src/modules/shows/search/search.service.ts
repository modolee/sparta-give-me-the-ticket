import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SHOW_MESSAGES } from 'src/commons/constants/shows/show-messages.constant';
import { Show } from 'src/entities/shows/show.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class SearchService {
  private readonly indexName = 'shows';

  constructor(
    private readonly eService: ElasticsearchService,
    @InjectRepository(Show) private readonly showRepository: Repository<Show>
  ) {}

  async onModuleInit() {
    await this.createIndex();
    await this.syncAllShows();
  }

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

  async syncAllShows() {
    try {
      const shows = await this.showRepository.find();
      for (const show of shows) {
        if (show.deletedAt === null) {
          await this.indexShowData(show);
        } else {
          await this.deleteShowIndex(show.id);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  @Cron('* * * * *') //1분 마다 동기화
  async handleCron() {
    await this.syncAllShows();
  }

  async createShowIndex(show: Show) {
    try {
      await this.indexShowData(show);
    } catch (error) {
      throw new InternalServerErrorException(SHOW_MESSAGES.INDEX.FAIL);
    }
  }

  async searchShows(category: string, search: string, page: number, limit: number) {
    const mustQueries = [];

    if (category) {
      mustQueries.push({ match: { category } });
    }

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
      return { results: [], total: 0 };
    }
  }

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
