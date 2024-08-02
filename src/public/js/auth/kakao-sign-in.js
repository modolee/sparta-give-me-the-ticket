window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const accessToken = urlParams.get('accessToken');
  const refreshToken = urlParams.get('refreshToken');

  if (accessToken && refreshToken) {
    window.localStorage.setItem('accessToken', accessToken);
    window.localStorage.setItem('refreshToken', refreshToken);
    // 로그인 완료 후 메인 페이지로 이동
    window.location.href = '/views';
  }
};
