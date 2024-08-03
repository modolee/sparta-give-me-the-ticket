//공연 상세 페이지
document.addEventListener('DOMContentLoaded', function () {
  const bookingBtn = document.querySelector('.booking__btn');
  const updateBtn = document.querySelector('.update__btn');
  const backBtn = document.querySelector('.back__btn');
  const showLink = document.getElementById('showLink');

  //----------- getShowDetail 함수 ---------------------
  async function getShowDetail(showId) {
    try {
      const response = await axios.get(`/shows/${showId}`);

      if (response.status === 200) {
        const { data } = response.data; // 중첩된 data 객체에서 정보 추출
        console.log('서버 응답:', data);
        const showsContainer = document.querySelector('#shows');
        showsContainer.innerHTML = '';

        const schedulesInfo = data.schedules
          .map((schedule) => `${schedule.date} ${schedule.time}`)
          .join(', ');

        const temp = `
    
          <h2>${data.title}</h2>
          <p>카테고리: ${data.category}</p>
          <p>가격: ${`${data.price}원`}</p>
          <p>상영 시간: ${`${data.runtime}분`}</p>
          <p>내용: ${data.content}</p>
          <p>위치: ${data.location}</p>
          <p>총 좌석: ${data.totalSeat}</p>
          <p>일정: ${schedulesInfo}</p>
        
      `;
        showsContainer.innerHTML = temp;
      } else {
        console.error('서버에서 데이터를 가져오지 못했습니다.');
      }
    } catch (error) {
      console.error('공연 정보 가져오기 오류:', error);
    }
  }

  //----------- showLink 클릭 이벤트 ---------------------
  // 공연 정보 보기 버튼 클릭 이벤트

  showLink.addEventListener('click', function (e) {
    e.preventDefault();
    const showId = Number(document.getElementById('showId').value);
    if (!showId) {
      alert('공연 ID를 입력하세요.');
      return;
    }
    getShowDetail(showId);
  });

  //----------- booking ---------------------
  // 예매 버튼 클릭 이벤트

  bookingBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views/shows/ticket';
  });

  //----------- update ---------------------
  // 업데이트 버튼 클릭 이벤트

  updateBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views';
  });

  //----------- back ---------------------
  // 돌아가기 버튼 클릭 이벤트

  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views';
  });
});
