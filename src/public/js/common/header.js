document.addEventListener('DOMContentLoaded', async () => {
  const signBefore = document.querySelector('#sign-in-before');
  const signAfter = document.querySelector('#sign-in-after');

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
  } catch (err) {
    console.log(err);
    // 토큰이 유효하지 않은, 즉 로그인하지 않은 상태라면
    signBefore.style.display = 'flex';
    signAfter.style.display = 'none';
  }
});
