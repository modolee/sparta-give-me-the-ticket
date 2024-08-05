document.addEventListener('DOMContentLoaded', function () {
  const bookingBtn = document.querySelector('.booking__btn');
  const updateBtn = document.querySelector('.update__btn');
  const backBtn = document.querySelector('.back__btn');
  const bookmarkBtn = document.querySelector('.bookmark__btn');
  const token = window.localStorage.getItem('accessToken');
  const scheduleDropdownMenu = document.querySelector('#scheduleDropdownMenu');
  const scheduleDropdown = document.querySelector('#scheduleDropdown');

  // 전역 변수 설정
  window.selectedScheduleId = null;
  let isBookmarked = false;
  let bookmarkId = null;
  //----------- getShowDetail 함수 ---------------------
  async function getShowDetail(showId) {
    try {
      const response = await axios.get(`/shows/${showId}`);

      if (response.status === 200 && response.data && response.data.date) {
        const data = response.data.date;

        const showsContainer = document.querySelector('#shows');
        showsContainer.innerHTML = `
          <p><img src="${data.imageUrl}" alt="${data.title}" style="max-width: 100%; height: auto;" /></p>
          <h2>${data.title}</h2>
          <p>카테고리: ${data.category}</p>
          <p>가격: ${data.price}원</p>
          <p>상영 시간: ${data.runtime}분</p>
          <p>내용: ${data.content}</p>
          <p>위치: ${data.location}</p>
          <p>총 좌석: ${data.totalSeat}석</p>
        `;

        if (data.schedules && data.schedules.length > 0) {
          scheduleDropdownMenu.innerHTML = data.schedules
            .map(
              (schedule) => `
              <li>
                <a class="dropdown-item" href="#" data-schedule-id="${schedule.id}">
                  ${schedule.date} ${schedule.time}
                </a>
              </li>
            `
            )
            .join('');

          // 저장된 스케줄 ID가 있는 경우 버튼 텍스트 업데이트
          if (window.selectedScheduleId) {
            const selectedSchedule = data.schedules.find(
              (schedule) => schedule.id === window.selectedScheduleId
            );
            if (selectedSchedule) {
              scheduleDropdown.textContent = `${selectedSchedule.date} ${selectedSchedule.time}`;
            }
          }
        } else {
          scheduleDropdownMenu.innerHTML =
            '<li><a class="dropdown-item">일정 정보가 없습니다.</a></li>';
        }

        // 초기 상태 설정
        isBookmarked = data.isBookmarked; // 서버로부터 초기 찜하기 상태를 가져온다고 가정합니다.
        bookmarkId = data.bookmarkId; // 서버로부터 bookmarkId를 가져온다고 가정합니다.
        updateBookmarkButton();
      } else {
        console.error('서버에서 데이터를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error('공연 정보 가져오기 오류:', error);
    }
  }

  function getShowIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1];
  }

  const showId = getShowIdFromPath();
  if (showId) {
    getShowDetail(showId);
  } else {
    console.error('공연 ID가 URL에 포함되어 있지 않습니다.');
  }

  // 예매 버튼 클릭 이벤트
  bookingBtn.addEventListener('click', function (e) {
    e.preventDefault();
    if (!window.selectedScheduleId) {
      alert('스케줄을 선택해주세요.');
      return;
    }
    window.location.href = `/views/shows/${showId}/ticket?selectedScheduleId=${window.selectedScheduleId}`;
  });

  updateBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views`;
  });

  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views`;
  });

  scheduleDropdownMenu.addEventListener('click', function (e) {
    if (e.target && e.target.matches('a.dropdown-item')) {
      const scheduleId = e.target.getAttribute('data-schedule-id');
      if (scheduleId) {
        window.selectedScheduleId = scheduleId; // 전역 변수에 저장
        scheduleDropdown.textContent = e.target.textContent;
        scheduleDropdown.classList.add('selected');
      } else {
        console.error('스케줄 ID가 없습니다.');
      }
    }
  });

  function updateBookmarkButton() {
    if (isBookmarked) {
      bookmarkBtn.classList.add('bookmarked');
      bookmarkBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"></path>
        </svg>
        찜하기 취소
      `;
    } else {
      bookmarkBtn.classList.remove('bookmarked');
      bookmarkBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
          <path d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"></path>
        </svg>
        찜하기
      `;
    }
  }

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', async function () {
      console.log('Bookmark button clicked');

      try {
        const response = await axios({
          method: isBookmarked ? 'delete' : 'post',
          url: isBookmarked
            ? `/shows/${showId}/bookmark/${bookmarkId}`
            : `/shows/${showId}/bookmark`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200 || response.status === 201) {
          isBookmarked = !isBookmarked;
          if (isBookmarked) {
            bookmarkId = response.data.bookmarkId; // 찜하기 성공 시 서버에서 bookmarkId를 반환한다고 가정합니다.
          } else {
            bookmarkId = null; // 찜하기 취소 시 bookmarkId를 초기화합니다.
          }
          updateBookmarkButton();
          alert(isBookmarked ? '찜하기가 완료되었습니다.' : '찜하기가 취소되었습니다.');
        } else {
          alert('요청에 실패하였습니다. 응답 상태 코드: ' + response.status);
        }
      } catch (error) {
        console.error('찜하기 오류:', error);
        alert('요청에 실패하였습니다.');
      }
    });
  }
});
