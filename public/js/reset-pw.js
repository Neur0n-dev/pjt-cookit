/* ===== Reset PW ===== */

/* ----- DOM ----- */
const elForm = document.getElementById('resetForm');
const elNewPw = document.getElementById('newPassword');
const elConfirmPw = document.getElementById('confirmPassword');
const elMatchMsg = document.getElementById('matchMsg');
const elResult = document.querySelector('.reset-result');

/* ----- UUID from sessionStorage ----- */
const userUuid = sessionStorage.getItem('resetUuid');

if (!userUuid) {
    alert('잘못된 접근입니다. 비밀번호 찾기를 먼저 진행해주세요.');
    window.location.href = '/find-pw';
}

/* ----- Password Toggle ----- */
document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-toggle');
        const input = document.querySelector(sel);
        if (!input) return;

        input.type = (input.type === 'password') ? 'text' : 'password';
        btn.textContent = (input.type === 'password') ? '👁' : '🙈';
    });
});

/* ----- Match Check ----- */
function renderMatchState() {
    if (!elNewPw.value || !elConfirmPw.value) {
        elMatchMsg.textContent = '';
        elMatchMsg.className = 'reset-inline-msg';
        return;
    }
    if (elNewPw.value === elConfirmPw.value) {
        elMatchMsg.textContent = '비밀번호가 일치합니다.';
        elMatchMsg.className = 'reset-inline-msg ok';
    } else {
        elMatchMsg.textContent = '비밀번호가 일치하지 않습니다.';
        elMatchMsg.className = 'reset-inline-msg bad';
    }
}

elNewPw.addEventListener('input', renderMatchState);
elConfirmPw.addEventListener('input', renderMatchState);

/* ----- Submit ----- */
elForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (elNewPw.value !== elConfirmPw.value) {
        elConfirmPw.focus();
        elMatchMsg.textContent = '비밀번호가 일치하지 않습니다.';
        elMatchMsg.className = 'reset-inline-msg bad';
        return;
    }

    try {
        const res = await fetch('/api/auth/reset-pw', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userUuid, password: elNewPw.value}),
        });
        const json = await res.json();

        if (json.result) {
            sessionStorage.removeItem('resetUuid');
            elResult.className = 'reset-result success';
            elResult.textContent = json.data.message;
            elResult.style.display = 'block';
            elForm.style.display = 'none';
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            elResult.className = 'reset-result error';
            elResult.textContent = json.message || '비밀번호 재설정에 실패했습니다.';
            elResult.style.display = 'block';
        }
    } catch (err) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});
