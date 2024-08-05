document.addEventListener('DOMContentLoaded', async () => {
  const signBefore = document.querySelector('#sign-in-before');
  const signAfter = document.querySelector('#sign-in-after');
  const signOutBtn = document.querySelector('#sign-out-btn');

  try {
    // localStorage에서 access token 가져오기
    const token = window.localStorage.getItem('accessToken');

    // 포인트 조회를 통해서 토큰이 유효한지 확인
    const response = await axios.get('/users/me/point', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 로그인 한 상태라면
    signBefore.style.display = 'none';
    signAfter.style.display = 'flex';

    // 로그아웃 이벤트 연결
    signOutBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        const token = window.localStorage.getItem('refreshToken');

        // axios에서 post이면서 보낼 값은 없고 config 옵션(params, headers 등)만 있다면
        // 보내는 인자값으로 null 같은 아무 값이 필요함
        const response = await axios.post('/auth/sign-out', null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // localStorage에 있는 토큰들 삭제
        window.localStorage.clear();
        // 성공 메세지 출력
        alert(response.data.message);
        // 로그아웃 완료 후 메인 페이지로 이동
        window.location.href = '/views';
      } catch (err) {
        console.log(err);
        const errorMessage = err.response.data.message;
        window.localStorage.clear();
        window.location.href = '/views';
        alert(errorMessage);
      }
    });
  } catch (err) {
    console.log(err);
    // 토큰이 유효하지 않은, 즉 로그인하지 않은 상태라면
    signBefore.style.display = 'flex';
    signAfter.style.display = 'none';
  }
});

// 브라우저 닫을 때 토큰 초기화
document.addEventListener('unload', () => {
  window.localStorage.clear();
});
