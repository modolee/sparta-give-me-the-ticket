import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async searchShows(category: string, search: string) {
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
    const result = await this.elasticsearchService.search({
      index: 'shows',
      body: {
        query: {
          bool: {
            must: mustQueries,
          },
        },
      },
    });

    // 검색 결과에서 히트된 문서 가져오기
    const hits = result.hits.hits;
    // 각 문서의 source 부분을 결과 리스트로 변환
    const results = hits.map((item) => item._source);

    // 총 히트 수 확인
    const totalHits =
      typeof result.hits.total === 'number' ? result.hits.total : result.hits.total.value;

    // 검색 결과와 총 히트 수 반환
    return { results, total: totalHits };
  }
}
