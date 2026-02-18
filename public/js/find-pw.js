/* ===== Find PW ===== */

/* ----- DOM ----- */
const elForm = document.querySelector('.find-form');
const elResult = document.querySelector('.find-result');

/* ----- Clear ----- */
document.querySelectorAll('[data-clear]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-clear');
        const input = document.querySelector(sel);
        if (!input) return;
        input.value = '';
        input.focus();
    });
});

/* ----- Find PW ----- */
elForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value.trim();
    const name = document.getElementById('name').value.trim();
    if (!userId || !name) return;

    try {
        const res = await fetch('/api/auth/find-pw', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({userId, name}),
        });
        const json = await res.json();

        if (json.result) {
            elResult.className = 'find-result success';
            elResult.textContent = '본인 확인이 완료되었습니다. 비밀번호 재설정 페이지로 이동합니다.';
            elResult.style.display = 'block';
            setTimeout(() => {
                window.location.href = '/reset-pw?uuid=' + json.data.userUuid;
            }, 1500);
        } else {
            elResult.className = 'find-result error';
            elResult.textContent = json.message || '입력하신 정보와 일치하는 계정이 없습니다.';
            elResult.style.display = 'block';
        }
    } catch (err) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});
