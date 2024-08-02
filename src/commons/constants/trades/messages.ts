export const MESSAGES = {
  TRADES: {
    IS_EXPIRED: { TICKET: '해당 티켓은 만료되었습니다.' },
    NOT_INPUT: { TICKET_ID: '티켓의 ID를 입력해주십시오.', PRICE: '가격을 입력해주십시오' },
    EQUAL: { BUYER_AND_SELLER: '구매자와 판매자가 동일합니다!' },
    NOT_EQUAL: {},
    NOT_EXISTS: {
      AUTHORITY: '권한이 없습니다',
      TRADE_LIST: '중고거래 목록이 존재하지 않습니다',
      TRADE_LOG: '중고거래 로그가 존재하지 않습니다!',
      TRADE: '존재하지 않는 거래입니다.',
      SHOW: '존재하지 않는 공연입니다.',
      TICKET: '존재하지 않는 티켓입니다.',
      SCHEDULE: '존재하지 않는 공연 일정입니다.',
      BUYER: '구매자가 존재하지 않습니다',
      SELLER: '판매자가 존재하지 않습니다',
    },
    NOT_HAVE: {
      TICKET: '해당 티켓을 소유하고 있지 않습니다',
    },
    NOT_ENOUGH: {
      MONEY: '금액이 충분하지 않습니다',
    },
    ALREADY_EXISTS: {
      IN_TRADE_TICKET: '해당 티켓은 이미 중고로 올라왔습니다.',
    },
    NOT_TYPE: { NUMBER: '숫자를 입력해 주십시오', STRING: '문장을 입력해주십시오' },
    SUCCESSFULLY_CREATE: {
      TICKET: '성공적으로 티켓이 발급되었습니다.',
      TRADE: '성공적으로 거래가 생성되었습니다.',
    },
    SUCCESSFULLY_UPDATE: {
      CHANGE_ROLE_ADMIN: '성공적으로 관리자로 권한이 변경되었습니다.',
      CHANGE_ROLE_USER: '성공적으로 유저로 권한이 변경되었습니다.',
    },
    SUCCESSFULLY_DELETE: {
      TRADE: '성공적으로 거래가 제거 되었습니다!',
      REDIS_TICKET: '레디스에서 성공적으로 티켓이 제거 되었습니다.',
    },
    CAN_NOT_LOAD: {},
    CAN_NOT_CREATE: {
      TICKET: '티켓을 생성할 수 없습니다',
      TRADE: '거래를 생성할 수 없습니다',
    },
    CAN_NOT_DELETE: {},
    CAN_NOT_UPDATE: { TICKET_PRICE: `원래 티켓 가격보다 높게 설정할 수 없습니다!` },
    ERROR_OCCUR: {
      REDIS: 'Redis에서 에러 발생',
    },
    FAILED: {
      CREATE_TRADE: '거래 생성에 실패했습니다',
      PURCHASE: '구매에 실패했습니다',
    },
  },
  REDIS: {
    SUCCESSFULLY_CONNECT: 'Redis connected successfully',
  },
  QUEUE: {
    TICKET_QUEUE: 'ticketQueue',
  },
};
