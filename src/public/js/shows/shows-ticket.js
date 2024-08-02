document.addEventListener('DOMContentLoaded', function () {
  const booking = document.querySelector('#booking');
  const bookingBtn = document.querySelector('.booking__btn');
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');

  //로그인한 사용자가 아니면 로그인 페이지로 이동
  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다');
  }

  //----------- booking ---------------------
  booking.addEventListener('click', function (e) {
    e.preventDefault();
    const h1 = signUp.closest('li').parentNode.previousElementSibling; // h1 요소 찾기
    h1.textContent = 'BOOKING TICKET';
    signUp.parentElement.style.opacity = '1';
    Array.from(signUp.parentElement.parentElement.children).forEach(function (sibling) {
      if (sibling !== signUp.parentElement) sibling.style.opacity = '.6';
    });
    bookingBtn.textContent = 'BOOK';

    // 티켓 구매 이벤트 연결
  });

  bookingBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // 기본 이벤트 동작을 막기 위한 부분

    // 티켓 예매 API에게 보낼 사용자 입력 DTO 객체 - 입력받을 객체들이 number 형식이라 Number()로 감싸줍니다.
    const createTicketDto = {
      scheduleId: Number(document.getElementById('scheduleId').value),
      showId: Number(document.getElementById('showId').value),
    };

    try {
      // 티켓 예매 API 호출. bearer token인 access 토큰을 header에 담기 때문에 같이 넣어줌.
      await axios.post(`/shows/${createTicketDto.showId}/ticket`, createTicketDto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('예매가 완료되었습니다');

      // 티켓 예매 완료 후 메인 페이지로 이동 - 마이페이지 생기면 경로 바꿀예정
      window.location.href = '/views';
    } catch (err) {
      // 티켓 예매 실패 시 에러 처리 (에러 메세지 출력.)
      console.log(err.response.data);
      const errorMessage = err.response.data.message;
      alert('티켓 정보가 잘못되었거나 문제가 발생하였습니다');
    }
  });

  //----------- back ---------------------
  //추후 경로 수정예정 - 예매를 하고 싶지 않으면 상세페이지로 돌아가기
  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views';
  });
});
