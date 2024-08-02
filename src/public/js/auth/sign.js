document.addEventListener('DOMContentLoaded', function () {
  const signUp = document.querySelector('#signup');
  const signIn = document.querySelector('#signin');
  const reset = document.querySelector('#reset');
  const firstInput = document.querySelector('.first-input');
  const hiddenInput = document.querySelector('#repeat__password');
  const signInBtn = document.querySelector('.signin__btn');

  // 이미 로그인 했는지 확인
  if (window.localStorage.getItem('accessToken')) {
    alert('이미 로그인한 사용자입니다.');
    window.location.href = '/views';
  }

  //----------- sign up ---------------------
  signUp.addEventListener('click', function (e) {
    e.preventDefault();
    const h1 = signUp.closest('li').parentNode.previousElementSibling; // h1 요소 찾기
    h1.textContent = 'SIGN UP';
    signUp.parentElement.style.opacity = '1';
    Array.from(signUp.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== signUp.parentElement) sibling.style.opacity = '.6';
    });
    firstInput.classList.remove('first-input__block');
    firstInput.classList.add('signup-input__block');
    hiddenInput.style.opacity = '1';
    hiddenInput.style.display = 'block';
    signInBtn.textContent = 'Sign up';

    // 회원 가입 이벤트 연결
  });

  //----------- sign in ---------------------
  signIn.addEventListener('click', function (e) {
    e.preventDefault();
    const h1 = signIn.closest('li').parentNode.previousElementSibling; // h1 요소 찾기
    h1.textContent = 'SIGN IN';
    signIn.parentElement.style.opacity = '1';
    Array.from(signIn.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== signIn.parentElement) sibling.style.opacity = '.6';
    });
    firstInput.classList.add('first-input__block');
    firstInput.classList.remove('signup-input__block');
    hiddenInput.style.opacity = '0';
    hiddenInput.style.display = 'none';
    signInBtn.textContent = 'Sign in';
  });

  // 로그인 이벤트 연결
  signInBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // 기본 이벤트 동작을 막기 위한 부분

    // 로그인 API에게 보낼 사용자 입력 DTO 객체
    const signInDto = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };

    try {
      // 백엔드 로그인 API 호출
      const result = await axios.post('/auth/sign-in', signInDto);

      // 반환된 토큰을 localStorage에 저장
      window.localStorage.setItem('accessToken', result.data.accessToken);
      window.localStorage.setItem('refreshToken', result.data.refreshToken);

      // 로그인 완료 후 메인 페이지로 이동
      window.location.href = '/views';
    } catch (err) {
      // 로그인 실패 시 에러 처리 (에러 메세지 출력)
      console.log(err.response.data);
      const errorMessage = err.response.data.message;
      alert(errorMessage);
    }
  });

  //----------- reset ---------------------
  reset.addEventListener('click', function (e) {
    e.preventDefault();
    const inputs = document.querySelectorAll('.input__block .input');
    inputs.forEach(function (input) {
      input.value = '';
    });
  });
});
