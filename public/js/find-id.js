/* ===== Find ID ===== */

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

/* ----- Find ID ----- */
elForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    if (!name) return;

    try {
        const res = await fetch('/api/auth/find-id', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name}),
        });
        const json = await res.json();

        if (json.result) {
            elResult.className = 'find-result success';
            elResult.innerHTML = '아이디: <strong>' + json.data.userId + '</strong>';
        } else {
            elResult.className = 'find-result error';
            elResult.textContent = json.message || '해당 이름으로 등록된 아이디가 없습니다.';
        }
        elResult.style.display = 'block';
    } catch (err) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});
