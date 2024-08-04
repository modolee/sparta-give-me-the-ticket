document.addEventListener('DOMContentLoaded', function () {
  const signUp = document.querySelector('#signup');
  const signIn = document.querySelector('#signin');
  const reset = document.querySelector('#reset');
  const firstInput = document.querySelector('.first-input');
  const hiddenInputNickname = document.querySelector('#nickname');
  const hiddenInputPw = document.querySelector('#repeat__password');
  const signInBtn = document.querySelector('.signin__btn');
  const signUpBtn = document.querySelector('.signup__btn');
  const kakaoSignInBtn = document.querySelector('.kakao__btn');

  // 이미 로그인 했는지 확인
  if (window.localStorage.getItem('accessToken')) {
    alert('잘못된 접근입니다. 다시 시도해 주세요.');
    window.localStorage.clear();
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
    // 회원가입에서는 닉네임과 비밀번호 확인 input이 보이도록 변경
    hiddenInputNickname.style.opacity = '1';
    hiddenInputNickname.style.display = 'block';
    hiddenInputPw.style.opacity = '1';
    hiddenInputPw.style.display = 'block';
    // 로그인 버튼은 감추고 회원가입 버튼 보이도록 변경
    signInBtn.style.opacity = '0';
    signInBtn.style.display = 'none';
    signUpBtn.style.opacity = '1';
    signUpBtn.style.display = 'block';

    // 회원 가입 이벤트 연결
    signUpBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      // 회원가입 DTO 객체
      const signUpDto = {
        nickname: document.getElementById('nickname').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        passwordCheck: document.getElementById('repeat__password').value,
      };

      try {
        // 백엔드 회원가입 API 호출
        await axios.post('/auth/sign-up', signUpDto);
        alert('회원가입에 성공했습니다. 로그인을 진행해 주세요.');
        // 로그인 페이지로 리다이렉트
        window.location.href = '/views/auth/sign';
      } catch (err) {
        console.log(err);
        const errorMessage = err.response.data.message;
        alert(errorMessage);
      }
    });
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
    hiddenInputNickname.style.opacity = '0';
    hiddenInputNickname.style.display = 'none';
    hiddenInputPw.style.opacity = '0';
    hiddenInputPw.style.display = 'none';
    signInBtn.style.opacity = '1';
    signInBtn.style.display = 'block';
    signUpBtn.style.opacity = '0';
    signUpBtn.style.display = 'none';
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
      const response = await axios.post('/auth/sign-in', signInDto);

      // 반환된 토큰을 localStorage에 저장
      window.localStorage.setItem('accessToken', response.data.accessToken);
      window.localStorage.setItem('refreshToken', response.data.refreshToken);

      // 로그인 완료 후 메인 페이지로 이동
      window.location.href = '/views';
    } catch (err) {
      // 로그인 실패 시 에러 처리 (에러 메세지 출력)
      console.log(err.response.data);
      const errorMessage = err.response.data.message;
      alert(errorMessage);
    }
  });

  //----------- kakao sign in ---------------------
  kakaoSignInBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    window.location.href = '/auth/kakao';
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
