import axios from 'axios';

document.addEventListener('DOMContentLoaded', function () {
  const myProfile = document.querySelector('#myProfile');
  const profileContent = document.querySelector('#profileContent');

  const updateBtn = document.querySelector('#updateBtn');
  const deleteBtn = document.querySelector('#deleteBtn');

  const token = window.localStorage.getItem('accessToken');

  //----------- my profile ---------------------
  myProfile.addEventListener('click', function (e) {
    e.preventDefault();

    const h1 = myProfile.closest('li').parentNode.previousSibling;
    h1.textContent = 'MY PROFILE';
    myProfile.parentElement.style.opacity = '1';
    Array.from(myProfile.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myProfile.parentElement) sibling.style.opacity = '.6';
    });
  });

  function showContent(content) {
    profileContent.style.display = 'none';

    content.style.display = 'block';
  }

  myProfile.addEventListener('click', async (e) => {
    e.preventDefault();
    showContent(profileContent);

    try {
      // 백엔드 사용자 프로필 조회 API 호출
      await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      // 사용자 프로필 조회 실패 시 에러 처리
      console.log(err.response.data);
      const errorMessage = err.response.data.message;
      alert(errorMessage);
    }
  });

  //----------- update user ---------------------
  updateBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views/users/me/update'; // 회원 정보 수정 페이지로 이동
  });

  //----------- delete user ---------------------
  deleteBtn.addEventListener('click', function (e) {
    e.preventDefault();

    // 회원 탈퇴 확인 팝업 창
  });
});
