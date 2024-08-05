document.addEventListener('DOMContentLoaded', function () {
  const createShowForm = document.querySelector('#createShowForm');
  const imageInputsContainer = document.querySelector('#imageInputsContainer');
  const addImageUrlBtn = document.querySelector('#addImageUrlBtn');
  const removeImageUrlBtn = document.querySelector('#removeImageUrlBtn');
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

  async function getUserInfo() {
    try {
      const response = await axios.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      return null;
    }
  }

  (async function () {
    console.log('Token:', token);

    try {
      const userInfo = await getUserInfo();
      if (!userInfo) {
        alert('접근 권한이 없습니다.');
        window.location.href = '/views'; // 메인 페이지로 이동
        return;
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 오류:', error);
      alert('사용자 정보를 가져오는 중 오류가 발생했습니다.');
      window.location.href = '/views'; // 오류가 발생해도 메인 페이지로 이동
      return;
    }

    // 이미지 URL 입력 시 미리보기 업데이트
    imageInputsContainer.addEventListener('input', function (event) {
      if (event.target.name === 'imageUrl') {
        updateImagePreview();
      }
    });

    // 이미지 추가 버튼 클릭 이벤트
    addImageUrlBtn.addEventListener('click', function () {
      const imageUrlInputs = imageInputsContainer.querySelectorAll('input[name="imageUrl"]');
      if (imageUrlInputs.length >= 5) {
        alert('최대 5개의 이미지만 추가할 수 있습니다.');
        return;
      }

      const imageInput = document.createElement('input');
      imageInput.type = 'text';
      imageInput.classList.add('form-control', 'mb-2');
      imageInput.name = 'imageUrl';
      imageInputsContainer.appendChild(imageInput);
    });

    // 이미지 삭제 버튼 클릭 이벤트
    removeImageUrlBtn.addEventListener('click', function () {
      const imageUrlInputs = imageInputsContainer.querySelectorAll('input[name="imageUrl"]');
      if (imageUrlInputs.length > 1) {
        imageInputsContainer.removeChild(imageUrlInputs[imageUrlInputs.length - 1]);
        updateImagePreview();
      } else {
        alert('최소 하나의 이미지 URL 입력칸이 필요합니다.');
      }
    });

    // 이미지 URL 입력 시 미리보기 업데이트
    function updateImagePreview() {
      const imageUrlInputs = imageInputsContainer.querySelectorAll('input[name="imageUrl"]');
      const urls = Array.from(imageUrlInputs)
        .map((input) => input.value.trim())
        .filter((url) => url);
      imagePreview.innerHTML = urls
        .map(
          (url) =>
            `<img src="${url}" alt="이미지 미리보기" style="max-width: 100px; margin-right: 10px;">`
        )
        .join('');
    }

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

      const imageUrls = Array.from(imageInputsContainer.querySelectorAll('input[name="imageUrl"]'))
        .map((input) => input.value.trim())
        .filter((url) => url);

      const createShowDto = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        runtime: Number(formData.get('runtime')),
        location: formData.get('location'),
        price: Number(formData.get('price')),
        totalSeat: Number(formData.get('totalSeat')),
        imageUrl: imageUrls,
        schedules: schedules,
      };

      // 요청 데이터 디버깅
      console.log('createShowDto:', createShowDto);

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
          imageInputsContainer.innerHTML = `
            <input type="text" class="form-control mb-2" name="imageUrl" required>
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
