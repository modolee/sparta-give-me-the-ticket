import { Role } from 'src/commons/types/users/user-role.type';
export const SWAGGER = {
  TRADES: {
    TRADES_API_TAGS: '중고거래',
    HELLO: {
      API_OPERATION: {
        SUMMARY: '유저 정보 확인 API',
        DESCRIPTION:
          '간단한 기능을 확인합니다. 내부함수가 숫자를 인수로 받습니다. 현재는 유저 정보 확인 API로 쓰입니다',
      },
    },
    TEST: {
      API_OPERATION: {
        SUMMARY: '테스트 API',
        DESCRIPTION: '함수나 기술을 적용하기 전 이 메서드에서 테스트 해본 뒤에 사용합니다',
      },
    },
    CHANGE_ROLE: {
      API_OPERATION: {
        SUMMARY: '역할 반전 API',
        DESCRIPTION: `역할이 ${Role.ADMIN}이라면 ${Role.USER}로 바꾸고,${Role.USER}라면 ${Role.ADMIN}으로 바꿉니다.
    이 API를 통해 한 계정이 여러 API를 사용할 수 있도록 합니다`,
      },
    },
    CHANGE_REMAIN_SEAT: {
      API_OPERATION: {
        SUMMARY: '공연 잔여 좌석 변경 API',
        DESCRIPTION: '공연의 남은 좌석 수를 45개로 바꿉니다',
      },
    },
    GET_TRADE_LOGS: {
      API_OPERATION: {
        SUMMARY: '트레이드 로그 출력 API',
        DESCRIPTION:
          '현재 사용자의 중고 거래 내역을 표시합니다. 기본적으로 판매한 항목, 구매한 항목이 전부 표시됩니다.',
      },
    },
    GET_TRADE_LIST: {
      API_OPERATION: {
        SUMMARY: '중고 거래 목록 조회 API',
        DESCRIPTION:
          '현재 게시되어 있는 중고거래의 목록이 전부 표시됩니다. 거래가 닫힌 경우에는 표시되지 않습니다.',
      },
    },
    CREATE_TRADE: {
      API_OPERATION: {
        SUMMARY: '중고 거래 생성 API',
        DESCRIPTION: `중고 거래를 생성합니다. 클라이언트에게 티켓 정보와 가격 정보를 요구합니다
    CreateTradeDto에 정의된 정보를 body를 통해 받으며 인가를 통해 사용자 정보를 받습니다.`,
      },
    },
    GET_DETAILED_TRADE: {
      API_OPERATION: {
        SUMMARY: '중고 거래 상세 조회 API',
        DESCRIPTION: `중고 거래를 상세하게 확인합니다.
      티켓 ID를 제외한 판매를 고려할 수 있는 상세한 정보를 현재 사용자에게 전달합니다.
      인가를 통해 사용자 정보를 받으며, 해당 거래의 Id를 사용자게 param으로 받습니다.`,
      },
    },
    UPDATE_TRADE: {
      API_OPERATION: {
        SUMMARY: '중고 거래 수정 API',
        DESCRIPTION: `중고 거래를 수정합니다. 클라이언트에게 티켓 가격을 요구하며, 해당 거래의 가격만을 수정할 수 있습니다.
    이때 사용자는 현재 티켓 가격을 초과하는 금액을 전달할 수 없습니다
    인가를 통해 사용자 정보를 받으며, 해당 거래의 Id를 사용자게 param으로 받습니다.`,
      },
    },
    DELETE_TRADE: {
      API_OPERATION: {
        SUMMARY: '중고 거래 삭제 API',
        DESCRIPTION:
          '중고 거래를 삭제할 수 있습니다.인가를 통해 사용자 정보를 받으며, 해당 거래의 Id를 사용자게 param으로 받습니다.',
      },
    },
    PURCHASE_TICKET: {
      API_OPERATION: {
        SUMMARY: '중고 거래 구매 API',
        DESCRIPTION: `중고 거래를 구매하는 API입니다. 트랜잭션으로 구현되어 ACID를 보장하고 있습니다. 
    QUEUE 또한 구현되어 있어, 동시성 문제와, 선착순 문재룰 해결하였습니다
    인가를 통해 사용자 정보를 받으며, 해당 거래의 Id를 사용자게 param으로 받습니다.`,
      },
    },
  },
};
