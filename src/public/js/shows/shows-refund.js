document.addEventListener('DOMContentLoaded', function () {
  const refundBtn = document.querySelector('.refund__btn');
  const backBtn = document.querySelector('.back__btn');
  const token = window.localStorage.getItem('accessToken');

  // Function to extract showId from the URL path
  function getShowIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 3]; // Adjust if needed
  }

  function getTicketIdFromPath() {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 1]; // Adjust if needed
  }

  // Initialize global variables
  const showId = getShowIdFromPath();
  const ticketId = getTicketIdFromPath();

  if (!token) {
    window.location.href = '/views/auth/sign';
    alert('로그인이 필요합니다');
    return;
  }

  refundBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const response = await axios.delete(`/shows/${showId}/ticket/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        alert('환불이 완료되었습니다');
        window.location.href = '/views';
      } else {
        alert('예매에 실패하였습니다. 응답 상태 코드: ' + response.status);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        alert(err.response.data.message);
      } else {
        console.error('Error:', err);
        alert('서버와의 통신 중 오류가 발생하였습니다.');
      }
    }
  });

  backBtn.addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = '/views';
  });
});
