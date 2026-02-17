/* ===== Header ===== */

/* ----- DOM ----- */
const elBtnLogin = document.getElementById('btn-login');
const elBtnMyKitchen = document.getElementById('btn-my-kitchen');

/* ----- State ----- */
let isLoggedIn = !!localStorage.getItem('token');
let onLoginStateChange = null;

/* ----- UI ----- */
function updateHeaderUI() {
    if (isLoggedIn) {
        elBtnLogin.textContent = 'Logout';
        elBtnMyKitchen.style.display = 'inline-flex';
    } else {
        elBtnLogin.textContent = 'Login';
        elBtnMyKitchen.style.display = 'none';
    }

    if (typeof onLoginStateChange === 'function') {
        onLoginStateChange(isLoggedIn);
    }
}

/* ----- Event ----- */
elBtnLogin.addEventListener('click', () => {
    if (isLoggedIn) {
        // TODO: 로그아웃 API 호출 (POST /api/auth/logout)
        isLoggedIn = false;
        updateHeaderUI();
    } else {
        window.location.href = '/login';
    }
});

elBtnMyKitchen.addEventListener('click', () => {
    window.location.href = '/my-kitchen';
});

/* ----- Init ----- */
(function initHeader() {
    updateHeaderUI();
})();
