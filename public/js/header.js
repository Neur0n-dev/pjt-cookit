/* ===== Header ===== */

/* ----- DOM ----- */
const elBtnLogin = document.getElementById('btn-login');
const elBtnMyKitchen = document.getElementById('btn-my-kitchen');

/* ----- State ----- */
// TODO: 로그인 연동 후 서버 세션/토큰으로 판단
let isLoggedIn = false;

/* =============================================
   헤더 UI 갱신
============================================= */

// 로그인 상태에 따라 버튼 표시/숨김
function updateHeaderUI() {
    if (isLoggedIn) {
        elBtnLogin.textContent = 'Logout';
        elBtnMyKitchen.style.display = 'inline-flex';
    } else {
        elBtnLogin.textContent = 'Login';
        elBtnMyKitchen.style.display = 'none';
    }
}

/* =============================================
   버튼 이벤트
============================================= */

// Login / Logout 버튼
elBtnLogin.addEventListener('click', () => {
    if (isLoggedIn) {
        // TODO: 로그아웃 API 호출 (POST /api/logout)
        isLoggedIn = false;
        updateHeaderUI();
    } else {
        // 로그인 페이지로 이동
        window.location.href = '/login';
    }
});

// My Kitchen 버튼
elBtnMyKitchen.addEventListener('click', () => {
    window.location.href = '/my-kitchen';
});

/* =============================================
   Init
============================================= */
(function initHeader() {
    updateHeaderUI();
})();
