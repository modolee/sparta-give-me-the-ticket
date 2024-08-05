export const SHOW_TICKETS = {
  COMMON: {
    SHOW: {
      HOURS: 2,
    },
    INDEX: {
      USER: 'userId',
      SHOW: 'showId',
    },
    SEAT: {
      DEDUCTED: 1,
      INCREASED: 1,
      UNSIGNED: 0,
    },
    REFUND_POINT: 0,
    TICKET: {
      HOURS: {
        NOW: 0,
        BEFORE_ONE_HOURS: 1,
        BEFORE_THREE_DAYS: 3,
        BEFORE_TEN_DAYS: 10,
        AFTER_TWENTY_FOUR_HOURS: 24,
        BEFORE_TWO_HOURS: 2,
      },
      PRICE: {
        ONE_HOURS: 1,
        THREE_DAYS: 72,
        TEN_DAYS: 240,
      },
      PERCENT: {
        TEN: 0.1,
        FIFTY: 0.5,
      },

      COUNT: {
        MAX: 5,
        TABLE: 'ticket',
        USER: 'ticket.userId = :userId',
        SHOW: 'ticket.showId = :showId',
      },

      REFUND_STATUS: 'REFUNDED',
    },
  },
};
