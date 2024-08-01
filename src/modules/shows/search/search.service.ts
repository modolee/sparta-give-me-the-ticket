import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { Image } from 'src/entities/images/image.entity';
import { Show } from 'src/entities/shows/show.entity';

@Injectable()
export class SearchService {
  constructor(private readonly eService: ElasticsearchService) {}

  async onModuleInit() {
    await this.createIndex();
  }

  private async createIndex() {
    const indexExists = await this.eService.indices.exists({ index: 'shows' });

    if (!indexExists.body) {
      await this.eService.indices.create({
        index: 'shows',
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              category: { type: 'keyword' },
            },
          },
        },
      });
    }
  }

  //공연 생성 시 인덱싱
  async creatShowIndex(show: Show, images: Image[]) {
    await this.eService.index({
      index: 'shows',
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
        schedules: show.schedules,
        imageUrl: images.map(({ imageUrl }) => imageUrl),
        createdAt: show.createdAt,
        updatedAt: show.updatedAt,
      },
    });
  }
  // 기존 데이터 한꺼번에 넣기(같이 업데이트해줘야 함) / 스케줄링 돌면서 주기에 맞춰서 데이터 인덱싱(updatedAt을 기준으로 - 1분주기로) / 삭제된 데이터도 관리

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
            fuzziness: 'auto',
          },
        },
      });
    }

    // elasticsearch 검색
    const result = await this.eService.search({
      index: 'shows',
      body: {
        query: {
          bool: {
            must: mustQueries,
          },
        },
        from: (page - 1) * limit,
        size: limit,
      },
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
  }

  //공연 삭제 시 인덱싱
  async deleteShowIndex(showId: number) {
    await this.eService.deleteByQuery({
      index: 'shows',
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
