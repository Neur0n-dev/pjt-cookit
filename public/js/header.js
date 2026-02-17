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
elBtnLogin.addEventListener('click', async () => {
    if (isLoggedIn) {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'}
            });
            const json = await res.json();

            if (json.result) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                isLoggedIn = false;
                updateHeaderUI();
                alert(json.message || '로그아웃에 성공하였습니다.');
                window.location.href = '/';
            }
        } catch (err) {
            alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
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
