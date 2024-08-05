document.addEventListener('DOMContentLoaded', function () {
  const myProfile = document.querySelector('#myProfile');
  const myPoint = document.querySelector('#myPoint');

  const profileContent = document.querySelector('#profileContent');
  const pointLogContent = document.querySelector('#pointLogContent');
  const pointLogContainer = document.getElementById('pointLogContainer');

  const updateBtn = document.querySelector('#updateBtn');
  const deleteBtn = document.querySelector('#deleteBtn');

  const token = window.localStorage.getItem('accessToken');

  // 내 정보 (profile)를 기본으로 가져옴
  getUserProfile();

  function showContent(content) {
    profileContent.style.display = 'none';
    pointLogContent.style.display = 'none';

    content.style.display = 'block';
  }

  //----------- my profile ---------------------
  myProfile.addEventListener('click', function (e) {
    e.preventDefault();

    myProfile.parentElement.style.opacity = '1';
    Array.from(myProfile.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myProfile.parentElement) sibling.style.opacity = '.6';
    });

    showContent(profileContent);
    getUserProfile();
  });

  async function getUserProfile() {
    try {
      // 백엔드 사용자 프로필 조회 API 호출
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response data: ', response.data);

      const user = response.data.getUserProfile;
      console.log('User data: ', user);

      document.getElementById('nickname').textContent = user.nickname;
      document.getElementById('email').textContent = user.email;
      document.getElementById('point').textContent = user.point;

      if (user && user.profileImg) {
        document.getElementById('profileImg').src = user.profileImg;
      } else {
        console.error('Profile image is undefined.');
        document.getElementById('profileImg').src =
          'https://e7.pngegg.com/pngimages/1000/665/png-clipart-computer-icons-profile-s-free-angle-sphere.png'; // 기본 이미지 URL
      }
    } catch (err) {
      // 사용자 프로필 조회 실패 시 에러 처리
      console.log(err.response.data);
      const errorMessage = err.response.data.message;
      alert(errorMessage);
    }
  }

  //----------- delete user ---------------------
  deleteBtn.addEventListener('click', async function (e) {
    e.preventDefault();
    try {
      // 회원 탈퇴 확인 창
      if (confirm('회원 탈퇴하시겠습니까?')) {
        if (confirm('정말로 탈퇴하시겠습니까?')) {
          // 백엔드 회원 탈퇴 API 호출
          const response = await axios.delete('/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // 탈퇴했기 때문에 localStorage에 있는 토큰들 삭제
          window.localStorage.clear();

          // 회원 탈퇴 성공 문구 출력
          alert(response.data.message);

          // 탈퇴 후 홈으로 이동
          window.location.href = '/views';
        }
      }
      return;
    } catch (err) {
      console.log(err);
      alert(err.response.data.message);
    }
  });
});
