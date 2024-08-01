import { MIN_SHOW_CONTENT_LENGTH } from './shows.constant';

export const SHOW_MESSAGES = {
  COMMON: {
    TITLE: {
      REQUIRED: '공연명을 입력해주세요.',
      EXISTED: '이미 등록된 공연입니다.',
    },

    CONTENT: {
      REQUIRED: '공연 설명을 입력해주세요.',
      MIN_LENGTH: `공연 설명은 ${MIN_SHOW_CONTENT_LENGTH}자 이상 작성해야합니다.`,
    },

    CATEGORY: {
      REQUIRED: '공연 카테고리를 입력해주세요.',
      INVALID: '유효하지 않은 카테고리입니다.',
    },

    RUNTIME: {
      REQUIRED: '공연 소요 시간을 입력해주세요.',
    },

    LOCATION: {
      REQUIRED: '공연 장소를 입력해주세요.',
    },

    PRICE: {
      REQUIRED: '공연 금액을 입력해주세요.',
    },

    TOTAL_SEAT: {
      REQUIRED: '공연 좌석 수를 입력해주세요.',
    },

    DATE: {
      REQUIRED: '공연 날짜를 입력해주세요.',
    },

    TIME: {
      REQUIRED: '공연 시간을 입력해주세요.',
    },

    IMAGE: {
      REQUIRED: '공연 이미지를 입력해주세요.',
    },

    NOT_FOUND: '공연이 존재하지 않습니다.',
  },
  CREATE: {
    SUCCEED: '공연 생성에 성공했습니다.',
    FAIL: '공연 생성에 실패했습니다.',
  },
  GET_LIST: {
    SUCCEED: '공연 조회에 성공했습니다.',
    FAIL: '공연 조회에 실패했습니다.',
  },
  GET: {
    SUCCEED: '공연 상세 조회에 성공했습니다.',
  },
  UPDATE: {
    SUCCEED: '공연 수정에 성공했습니다.',
    NO_BODY_DATE: '수정 할 정보를 입력해 주세요.',
    TOTAL_SEAT: '총 좌석수는 수정할 수 없습니다.',
    FAIL: '공연 수정에 실패했습니다.',
  },
  DELETE: {
    SUCCEED: '공연 삭제에 성공했습니다.',
    FAIL: '공연 삭제에 실패했습니다.',
  },
  INDEX: {
    FAIL: '공연 데이터 인덱싱에 실패했습니다.',
  },
};
