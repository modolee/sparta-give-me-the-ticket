document.addEventListener('DOMContentLoaded', function () {
  const myProfile = document.querySelector('#myProfile');
  const profileContent = document.querySelector('#profileContent');

  const updateBtn = document.querySelector('#updateBtn');
  const deleteBtn = document.querySelector('#deleteBtn');

  const token = window.localStorage.getItem('accessToken');

  // 내 정보 (profile)를 기본으로 가져옴
  getUserProfile();

  function showContent(content) {
    profileContent.style.display = 'none';

    content.style.display = 'block';
  }

  //----------- my profile ---------------------
  myProfile.addEventListener('click', function (e) {
    e.preventDefault();

    const h1 = myProfile.closest('li').parentNode.previousSibling;
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
