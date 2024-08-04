document.addEventListener('DOMContentLoaded', function () {
  const bookingBtn = document.querySelector('.booking__btn');
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');

  function getShowIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 2]; // parameter에서 showId를 받는 위치
  }

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const showId = getShowIdFromPath();
  const selectedScheduleId = getQueryParam('selectedScheduleId');

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다');
    return;
  }

  bookingBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!selectedScheduleId) {
      alert('선택한 스케줄이 없습니다.');
      return;
    }

    const createTicketDto = {
      scheduleId: Number(selectedScheduleId),
    };

    try {
      const response = await axios.post(`/shows/${showId}/ticket`, createTicketDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        alert('예매가 완료되었습니다');
        window.location.href = '/views';
      } else {
        alert('예매에 실패하였습니다. 응답 상태 코드: ' + response.status);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.error('Error response data:', err.response.data);
        alert('티켓 정보가 잘못되었거나 문제가 발생하였습니다: ' + err.response.data.message);
      } else {
        console.error('Error:', err);
        alert('서버와의 통신 중 오류가 발생하였습니다.');
      }
    }
  });

  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `/views/shows/${showId}`;
  });
});
