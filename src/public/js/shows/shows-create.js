document.addEventListener('DOMContentLoaded', function () {
  const createShowForm = document.querySelector('#createShowForm');
  const imageUrlInput = document.querySelector('#imageUrl');
  const imagePreview = document.querySelector('#imagePreview');
  const schedulesContainer = document.querySelector('#schedulesContainer');
  const addScheduleBtn = document.querySelector('#addScheduleBtn');
  const removeScheduleBtn = document.querySelector('#removeScheduleBtn');
  const token = window.localStorage.getItem('accessToken');

  if (!token) {
    alert('로그인이 필요합니다');
    window.location.href = '/views/auth/sign';
    return;
  }

  (async function () {
    console.log('Token:', token);

    try {
      const userInfo = await getUserInfo();
      if (!userInfo || userInfo.role !== 'ADMIN') {
        alert('접근 권한이 없습니다.');
        window.location.href = '/';
        return;
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
      window.location.href = '/';
      return;
    }

    // 이미지 URL 입력 시 미리보기 업데이트
    imageUrlInput.addEventListener('input', function () {
      const urls = imageUrlInput.value.split(',').map((url) => url.trim());
      imagePreview.innerHTML = urls
        .map(
          (url) =>
            `<img src="${url}" alt="이미지 미리보기" style="max-width: 100px; margin-right: 10px;">`
        )
        .join('');
    });

    // 스케줄 추가 버튼 클릭 이벤트
    addScheduleBtn.addEventListener('click', function () {
      const scheduleInput = document.createElement('div');
      scheduleInput.classList.add('schedule-input', 'mb-3');
      scheduleInput.innerHTML = `
        <input type="date" class="form-control mb-2" name="scheduleDate" required>
        <input type="time" class="form-control mb-2" name="scheduleTime" required>
      `;
      schedulesContainer.appendChild(scheduleInput);
    });

    // 스케줄 삭제 버튼 클릭 이벤트
    removeScheduleBtn.addEventListener('click', function () {
      const scheduleInputs = schedulesContainer.querySelectorAll('.schedule-input');
      if (scheduleInputs.length > 1) {
        schedulesContainer.removeChild(scheduleInputs[scheduleInputs.length - 1]);
      } else {
        alert('최소 하나의 스케줄은 필요합니다.');
      }
    });

    // 공연 생성 폼 제출 이벤트
    createShowForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const formData = new FormData(createShowForm);
      const schedules = [];
      schedulesContainer.querySelectorAll('.schedule-input').forEach((scheduleInput) => {
        const date = scheduleInput.querySelector('input[name="scheduleDate"]').value;
        const time = scheduleInput.querySelector('input[name="scheduleTime"]').value;
        schedules.push({ date, time });
      });

      const createShowDto = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        runtime: formData.get('runtime'),
        location: formData.get('location'),
        price: formData.get('price'),
        totalSeat: formData.get('totalSeat'),
        imageUrl: formData
          .get('imageUrl')
          .split(',')
          .map((url) => url.trim()),
        schedules: schedules,
      };

      try {
        const response = await axios.post('/shows', createShowDto, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('Response:', response);

        if (response.status === 201) {
          alert('공연이 성공적으로 생성되었습니다.');
          createShowForm.reset();
          imagePreview.innerHTML = '';
          schedulesContainer.innerHTML = `
            <div class="schedule-input mb-3">
              <input type="date" class="form-control mb-2" name="scheduleDate" required>
              <input type="time" class="form-control mb-2" name="scheduleTime" required>
            </div>
          `;
        } else {
          alert('공연 생성에 실패했습니다.');
        }
      } catch (error) {
        console.error('공연 생성 오류:', error);
        alert('공연 생성 중 오류가 발생했습니다.');
      }
    });
  })();
});
