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

  //----------- my point ---------------------
  myPoint.addEventListener('click', function (e) {
    e.preventDefault();

    myPoint.parentElement.style.opacity = '1';
    Array.from(myPoint.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== myPoint.parentElement) sibling.style.opacity = '.6';
    });

    showContent(pointLogContent);
    getPointLog();
  });

  async function getPointLog() {
    try {
      // 백엔드 사용자 포인트 내역 조회 API 호출
      const response = await axios.get('/users/me/point', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response data: ', response.data);

      const pointLog = response.data.getPointLog;
      console.log('Point Log: ', pointLog);

      // 포인트 내역이 존재하지 않을 때
      if (pointLog.length === 0) {
        alert('포인트 내역이 없습니다.');
        return;
      }

      pointLogContainer.innerHTML = '';

      pointLog.forEach((log, index) => {
        const logElement = document.createElement('div');
        logElement.classList.add('point-log');

        const createdAtElement = document.createElement('p');
        createdAtElement.textContent = `Date : ${log.createdAt}`;
        logElement.appendChild(createdAtElement);

        const priceElement = document.createElement('p');
        priceElement.textContent = `Price : ${log.price}`;
        logElement.appendChild(priceElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = `Description : ${log.description}`;
        logElement.appendChild(descriptionElement);

        const typeElement = document.createElement('p');
        typeElement.textContent = `Type : ${log.type}`;
        logElement.appendChild(typeElement);

        pointLogContainer.appendChild(logElement);

        if (index < pointLog.length - 1) {
          const separator = document.createElement('hr');
          separator.classList.add('separator');
          pointLogContainer.appendChild(separator);
        }
      });
    } catch (err) {
      // 사용자 포인트 내역 조회 실패 시 에러 처리
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
