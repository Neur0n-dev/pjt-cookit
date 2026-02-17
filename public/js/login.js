/* ===== Login ===== */
/* ----- DOM ----- */
const elTabs = document.querySelector('.login-tabs');
const elPanels = document.querySelectorAll('.login-panel');

/* ----- Tab ----- */
elTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab) return;

    elTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const key = tab.dataset.tab;
    elPanels.forEach(p => p.classList.remove('active'));
    const target = document.getElementById('panel-' + key);
    if (target) target.classList.add('active');
});

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

/* ----- Login ----- */
const elForm = document.querySelector('.login-form');
elForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const elAlert = document.querySelector('.login-alert');
    const body = {
        userId: document.getElementById('userId').value.trim(),
        password: document.getElementById('password').value,
    };

    if (!body.userId || !body.password) {
        if (elAlert) {
            elAlert.textContent = '아이디와 비밀번호를 입력해주세요.';
            elAlert.style.display = 'block';
        }
        return;
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => null);
            if (elAlert) {
                elAlert.textContent = err?.message || '로그인에 실패했습니다.';
                elAlert.style.display = 'block';
            }
            return;
        }

        const json = await res.json();
        if (json.result) {
            localStorage.setItem('token', json.data.token);
            localStorage.setItem('user', JSON.stringify(json.data.user));
            location.href = '/';
        } else {
            if (elAlert) {
                elAlert.textContent = json.message || '로그인에 실패했습니다.';
                elAlert.style.display = 'block';
            }
        }

    } catch (err) {
        alert('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
});

