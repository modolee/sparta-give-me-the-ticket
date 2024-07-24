export const USER_MESSAGES = {
  USER: {
    USERINFO: {
      UPDATE: {
        SUCCESS: '사용자 정보 수정에 성공했습니다.',
        FAILURE: {
          USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
          EMAIL: {
            EMPTY: '이메일을 입력해 주세요.',
            CONFLICT: '이미 다른 회원이 사용 중인 이메일 입니다.',
          },
          NICKNAME: {
            EMPTY: '닉네임을 입력해 주세요.',
            CONFLICT: '이미 다른 회원이 사용 중인 닉네임 입니다.',
          },
          PASSWORD: {
            NOW: '현재 비밀번호를 입력해 주세요.',
            CHANGE: '변경할 비밀번호를 입력해 주세요.',
            WEAK: '비밀번호 규칙이 올바르지 않습니다.',
            MISMATCH: '현재 비밀번호가 일치하지 않습니다.',
          },
          PROFILEIMG: {
            EMPTY: '프로필 이미지를 등록해 주세요.',
          },
        },
      },
    },
  },
};
