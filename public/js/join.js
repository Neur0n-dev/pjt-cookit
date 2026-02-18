/* ===== Join ===== */

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

/* ----- Password Toggle ----- */
document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
        const sel = btn.getAttribute('data-toggle');
        const input = document.querySelector(sel);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    });
});

/* ----- Duplicate Check ----- */
const checkState = { userId: false, nickname: false };

document.querySelectorAll('.btn-check').forEach((btn) => {
    btn.addEventListener('click', async () => {
        const field = btn.dataset.check; // userId | nickname
        const input = document.getElementById(field);
        const msg = document.getElementById('msg-' + field);
        if (!input || !msg) return;

        const value = input.value.trim();
        if (!value) {
            msg.className = 'field-msg is-error';
            msg.textContent = '값을 먼저 입력해 주세요.';
            checkState[field] = false;
            input.focus();
            return;
        }

        try {
            const res = await fetch(`/api/auth/check/${field}?value=${encodeURIComponent(value)}`);
            const json = await res.json();

            if (json.data.available) {
                msg.className = 'field-msg is-ok';
                msg.textContent = '사용 가능합니다.';
                checkState[field] = true;
            } else {
                msg.className = 'field-msg is-error';
                msg.textContent = field === 'userId' ? '이미 사용 중인 아이디입니다.' : '이미 사용 중인 닉네임입니다.';
                checkState[field] = false;
            }
        } catch (err) {
            msg.className = 'field-msg is-error';
            msg.textContent = '확인 중 오류가 발생했습니다.';
            checkState[field] = false;
        }
    });
});

/* ----- Reset Check on Input ----- */
['userId', 'nickname'].forEach((field) => {
    const input = document.getElementById(field);
    if (!input) return;
    input.addEventListener('input', () => {
        checkState[field] = false;
        const msg = document.getElementById('msg-' + field);
        if (msg) {
            msg.className = 'field-msg';
            msg.textContent = '';
        }
    });
});

/* ----- Register ----- */
const elForm = document.querySelector('.join-form');
elForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!checkState.userId) {
        const msg = document.getElementById('msg-userId');
        msg.className = 'field-msg is-error';
        msg.textContent = '아이디 중복확인을 해주세요.';
        return;
    }
    if (!checkState.nickname) {
        const msg = document.getElementById('msg-nickname');
        msg.className = 'field-msg is-error';
        msg.textContent = '닉네임 중복확인을 해주세요.';
        return;
    }

    const body = {
        userId: document.getElementById('userId').value.trim(),
        password: document.getElementById('password').value,
        name: document.getElementById('name').value.trim(),
        nickname: document.getElementById('nickname').value.trim(),
    };

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const json = await res.json();

        if (json.result) {
            alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
            location.href = '/login';
        } else {
            const elAlert = document.querySelector('.join-alert');
            if (elAlert) {
                elAlert.textContent = json.message || '회원가입에 실패했습니다.';
                elAlert.style.display = 'block';
            } else {
                alert(json.message || '회원가입에 실패했습니다.');
            }
        }
    } catch (err) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});
