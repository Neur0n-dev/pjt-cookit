/* ===== My Kitchen ===== */

/* ----- State ----- */
const state = {
    profile: null,              // { 이름, 닉네임, 등급}
    ingredients: [],            // API에서 재료 데이터 로드
    favorites: [],              // API에서 즐겨찾기 데이터 로드
    ingredientSearchQuery: '',  // 재료 검색어
    ingredientSort: 'latest',   // 재료 정렬{최신, 이름)
    favoriteSearchQuery: '',    // 즐겨찾기 검색어
}

/* ----- DOM ----- */
// 프로필
const elProfileName = document.getElementById('profile-name');
const elProfileNickname = document.getElementById('profile-nickname');
// 통계
const elStatIngredient = document.getElementById('stat-ingredient');
const elStatFavorite = document.getElementById('stat-favorite');
// 대시보드 탭
const elDashboardTabs = document.getElementById('dashboard-tabs');
// 재료 패널
const elIngredientSearchInput = document.getElementById('ingredient-search-input');
const elIngredientSearchClear = document.getElementById('ingredient-search-clear');
const elIngredientSort = document.getElementById('ingredient-sort');
const elBtnIngredientAdd = document.getElementById('btn-ingredient-add');
const elIngredientList = document.getElementById('ingredient-list');
// 즐겨찾기 패널
const elFavoriteSearchInput = document.getElementById('favorite-search-input');
const elFavoriteSearchClear = document.getElementById('favorite-search-clear');
const elFavoriteList = document.getElementById('favorite-list');
// 회원정보 수정 패널
const elSettingsName = document.getElementById('settings-name');
const elSettingsNickname = document.getElementById('settings-nickname');
const elBtnSettingsReset = document.getElementById('btn-settings-reset');
const elBtnSettingsSave = document.getElementById('btn-settings-save');
const elBtnSettingsPassword = document.getElementById('btn-settings-password');
// 재료 모달
const elModalIngredientName = document.getElementById('modal-ingredient-name');
const elModalIngredientQuantity = document.getElementById('modal-ingredient-quantity');
const elModalIngredientUnit = document.getElementById('modal-ingredient-unit');
const elModalIngredientMemo = document.getElementById('modal-ingredient-memo');
const elModalIngredientExpiry = document.getElementById('modal-ingredient-expiry');
const elModalIngredientUuid = document.getElementById('modal-ingredient-uuid');
const elBtnModalIngredientSave = document.getElementById('btn-modal-ingredient-save');
// 삭제 모달
const elModalDeleteMsg = document.getElementById('modal-delete-msg');
const elBtnModalDeleteConfirm = document.getElementById('btn-modal-delete-confirm');
// 비밀번호 변경 모달
const elModalPasswordCurrent = document.getElementById('modal-password-current');
const elModalPasswordNew = document.getElementById('modal-password-new');
const elModalPasswordConfirm = document.getElementById('modal-password-confirm');
const elBtnModalPasswordSave = document.getElementById('btn-modal-password-save');

/* ----- Auth ----- */
const token = localStorage.getItem('token');

/* ----- Modal ----- */
function openModal(id) {
    const elModal = document.getElementById(id);
    if (!elModal) return;
    elModal.classList.add('is-open');
    elModal.setAttribute('aria-hidden', 'false');
}

function closeModal(id) {
    const elModal = document.getElementById(id);
    if (!elModal) return;
    elModal.classList.remove('is-open');
    elModal.setAttribute('aria-hidden', 'true');
}

/* ----- Toast ----- */
function showToast(msg) {
    Toastify({
        text: msg,
        duration: 2000,
        gravity: 'top',
        position: 'center',
        stopOnFocus: false,
        style: {
            background: '#0b0f19',
            borderRadius: '999px',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '15px',
            padding: '14px 26px',
            boxShadow: '0 10px 30px rgba(11,15,25,0.18)',
            letterSpacing: '-0.01em',
        },
    }).showToast();
}

function openDeleteModal(msg, callback) {
    elModalDeleteMsg.textContent = msg;
    elBtnModalDeleteConfirm.onclick = () => {
        closeModal('modal-delete');
        callback();
    };
    openModal('modal-delete');
}

/* ----- Events: Modal ----- */
function bindModalEvents() {
    // data-close 클릭 시 해당 모달 닫기
    document.addEventListener('click', (e) => {
        const modalId = e.target.dataset.close;
        if (modalId) closeModal(modalId);
    });

    // ESC 키로 열린 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        document.querySelectorAll('.modal.is-open').forEach(m => closeModal(m.id));
    });
}

/* ----- Tab change ----- */
function switchTab(tabName) {
    // 탭 버튼
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // 패널
    document.querySelectorAll('.dashboard-panel').forEach(p => p.classList.remove('active'));
    const target = document.getElementById('panel-' + tabName);
    if (target) target.classList.add('active');
}

/* ----- Render ----- */

/* ----- Profile ----- */
function renderProfile() {
    const {name, nickname} = state.profile;
    elProfileName.textContent = name;
    elProfileNickname.textContent = nickname;
    elSettingsName.value = name;
    elSettingsNickname.value = nickname;
}

/* ----- Ingredients ----- */
function renderIngredients() {
    let list = [...state.ingredients];

    // 검색 필터
    if (state.ingredientSearchQuery) {
        list = list.filter(i => i.name.includes(state.ingredientSearchQuery));
    }

    // 정렬
    if (state.ingredientSort === 'name') {
        list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
        list.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }

    // 통계 갱신
    elStatIngredient.textContent = `${state.ingredients.length}개`;

    // 빈 상태
    if (list.length === 0) {
        const msg = state.ingredients.length === 0
            ? '추가한 재료가 없습니다.'
            : '검색 결과가 없습니다.';
        elIngredientList.innerHTML = `<p class="panel-empty">${msg}</p>`;
        return;
    }

    elIngredientList.innerHTML = list.map(i => {
        const qtyNum = parseFloat(i.quantity);
        const qtyDisplay = i.quantity ? (!isNaN(qtyNum) ? qtyNum : i.quantity) : '';
        const quantityText = qtyDisplay !== '' ? `<span class="ingredient-item-qty">(${qtyDisplay}${i.unit || ''})</span>` : '';
        const expiryText = i.expiryDate === '3000-12-31' ? '미정' : i.expiryDate;
        const memoLine = i.memo ? `<p class="ingredient-item-meta">메모: ${i.memo}</p>` : '';
        const expiryLine = `<p class="ingredient-item-meta">유통기한: ${expiryText}</p>`;
        return `
        <div class="ingredient-item" data-uuid="${i.uuid}">
            <div class="ingredient-item-left">
                <p class="ingredient-item-title">${i.name} ${quantityText}</p>
                ${memoLine}
                ${expiryLine}
            </div>
            <div class="ingredient-item-right">
                <button class="btn-kitchen btn-kitchen-ghost btn-ingredient-edit" type="button">편집</button>
                <button class="btn-kitchen btn-kitchen-danger btn-ingredient-delete" type="button">삭제</button>
            </div>
        </div>`;
    }).join('');
}

/* ----- Favorites ----- */
function renderFavorites() {
    let list = [...state.favorites];

    // 검색 필터
    if (state.favoriteSearchQuery) {
        list = list.filter(f =>
            f.title.includes(state.favoriteSearchQuery) ||
            (f.description && f.description.includes(state.favoriteSearchQuery))
        );
    }

    // 통계 갱신
    elStatFavorite.textContent = `${state.favorites.length}개`;

    // 빈 상태
    if (list.length === 0) {
        const msg = state.favorites.length === 0
            ? '즐겨찾기한 레시피가 없습니다.'
            : '검색 결과가 없습니다.';
        elFavoriteList.innerHTML = `<p class="panel-empty">${msg}</p>`;
        return;
    }

    elFavoriteList.innerHTML = list.map(f => `
        <div class="favorite-item" data-uuid="${f.uuid}">
            <div class="favorite-item-left">
                <p class="favorite-item-title">${f.title}</p>
                ${f.description ? `<p class="favorite-item-desc">${f.description}</p>` : ''}
            </div>
            <div class="favorite-item-right">
                <button class="btn-kitchen btn-kitchen-ghost btn-favorite-view" type="button">보기</button>
                <button class="btn-kitchen btn-kitchen-danger btn-favorite-delete" type="button">삭제</button>
            </div>
        </div>`
    ).join('');
}

/* ----- Events ----- */

/* ----- Tab ----- */
function bindTabEvents() {
    elDashboardTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        switchTab(btn.dataset.tab);
    });
}

/* ----- Ingredient ----- */
function bindIngredientEvents() {
    // 검색어 입력
    elIngredientSearchInput.addEventListener('input', (e) => {
        if (e.isComposing) return;
        state.ingredientSearchQuery = e.target.value.trim();
        renderIngredients();
    });

    // 검색 초기화
    elIngredientSearchClear.addEventListener('click', () => {
        elIngredientSearchInput.value = '';
        state.ingredientSearchQuery = '';
        renderIngredients();
    });

    // 정렬 변경
    elIngredientSort.addEventListener('change', () => {
        state.ingredientSort = elIngredientSort.value;
        renderIngredients();
    });

    // 재료 추가 버튼
    elBtnIngredientAdd.addEventListener('click', () => {
        elModalIngredientUuid.value = '';
        elModalIngredientName.value = '';
        elModalIngredientQuantity.value = '';
        elModalIngredientUnit.value = '';
        elModalIngredientMemo.value = '';
        elModalIngredientExpiry.value = '';
        openModal('modal-ingredient');
    });

    // 재료 목록 이벤트 위임 (편집 / 삭제)
    elIngredientList.addEventListener('click', (e) => {
        const item = e.target.closest('[data-uuid]');
        if (!item) return;
        const uuid = item.dataset.uuid;
        const ingredient = state.ingredients.find(i => i.uuid === uuid);
        if (!ingredient) return;

        if (e.target.closest('.btn-ingredient-edit')) {
            elModalIngredientUuid.value = ingredient.uuid;
            elModalIngredientName.value = ingredient.name;
            elModalIngredientQuantity.value = ingredient.quantity || '';
            elModalIngredientUnit.value = ingredient.unit || '';
            elModalIngredientMemo.value = ingredient.memo || '';
            elModalIngredientExpiry.value = ingredient.expiryDate !== '3000-12-31' ? ingredient.expiryDate : '';
            openModal('modal-ingredient');
        }

        if (e.target.closest('.btn-ingredient-delete')) {
            openDeleteModal(`"${ingredient.name}" 을(를) 삭제하시겠습니까?`, async () => {
                try {
                    const res = await fetch(`/api/user/ingredients/${uuid}`, {
                        method: 'DELETE',
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    const json = await res.json();
                    if (!json.result) return;
                    await loadIngredients();
                    showToast('재료가 삭제되었습니다.');
                } catch (err) {
                    console.error('deleteIngredient error:', err);
                }
            });
        }
    });

    // 재료 모달 저장
    elBtnModalIngredientSave.addEventListener('click', async () => {
        const name = elModalIngredientName.value.trim();
        if (!name) {
            elModalIngredientName.focus();
            return;
        }
        const uuid = elModalIngredientUuid.value;
        if (uuid) {
            // 재료 수정
            try {
                const res = await fetch(`/api/user/ingredients/${uuid}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: elModalIngredientName.value.trim(),
                        quantity: elModalIngredientQuantity.value.trim(),
                        unit: elModalIngredientUnit.value.trim(),
                        memo: elModalIngredientMemo.value.trim(),
                        expiryDate: elModalIngredientExpiry.value,
                    })
                });
                const json = await res.json();
                if (!json.result) return;
                closeModal('modal-ingredient');
                await loadIngredients();
                showToast('재료가 수정되었습니다.');
            } catch (err) {
                console.error('updateIngredient error:', err);
            }
        } else {
            // 재료 추가
            try {
                const res = await fetch('/api/user/ingredients', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: elModalIngredientName.value.trim(),
                        quantity: elModalIngredientQuantity.value.trim(),
                        unit: elModalIngredientUnit.value.trim(),
                        memo: elModalIngredientMemo.value.trim(),
                        expiryDate: elModalIngredientExpiry.value,
                    })
                });
                const json = await res.json();
                if (!json.result) return;
                closeModal('modal-ingredient');
                await loadIngredients();
                showToast('재료가 추가되었습니다.');
            } catch (err) {
                console.error('addIngredient error:', err);
            }
        }
    });
}

/* ----- Favorite ----- */
function bindFavoriteEvents() {
    // 검색어 입력
    elFavoriteSearchInput.addEventListener('input', (e) => {
        if (e.isComposing) return;
        state.favoriteSearchQuery = e.target.value.trim();
        renderFavorites();
    });

    // 검색 초기화
    elFavoriteSearchClear.addEventListener('click', () => {
        elFavoriteSearchInput.value = '';
        state.favoriteSearchQuery = '';
        renderFavorites();
    });

    // 즐겨찾기 목록 이벤트 위임 (상세보기 / 삭제)
    elFavoriteList.addEventListener('click', (e) => {
        const item = e.target.closest('[data-uuid]');
        if (!item) return;
        const uuid = item.dataset.uuid;
        const favorite = state.favorites.find(f => f.uuid === uuid);
        if (!favorite) return;

        if (e.target.closest('.btn-favorite-view')) {
            // TODO: 즐겨찾기 상세 모달
        }

        if (e.target.closest('.btn-favorite-delete')) {
            openDeleteModal(`"${favorite.title}" 을(를) 즐겨찾기에서 삭제하시겠습니까?`, () => {
                // TODO: DELETE /api/favorites/:id
            });
        }
    });
}

/* ----- Settings ----- */
function bindSettingsEvents() {
    // 프로필 수정
    elBtnSettingsSave.addEventListener('click', async () => {
        const name = elSettingsName.value.trim();
        const nickname = elSettingsNickname.value.trim();
        if (!name || !nickname) return;
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({name, nickname})
            });
            const json = await res.json();
            if (!json.result) return;
            state.profile = {...state.profile, name, nickname};
            renderProfile();
            showToast('회원정보가 수정되었습니다.');
        } catch (err) {
            console.error('updateProfile error:', err);
        }
    });

    // 되돌리기
    elBtnSettingsReset.addEventListener('click', () => {
        elSettingsName.value = state.profile?.name || '';
        elSettingsNickname.value = state.profile?.nickname || '';
    });
}

/* ----- Events: Password ----- */
function bindPasswordEvents() {
    // 비밀번호 변경 버튼 → 모달 열기
    elBtnSettingsPassword.addEventListener('click', () => {
        elModalPasswordCurrent.value = '';
        elModalPasswordNew.value = '';
        elModalPasswordConfirm.value = '';
        openModal('modal-password');
    });

    // 비밀번호 수정
    elBtnModalPasswordSave.addEventListener('click', async () => {
        const current = elModalPasswordCurrent.value;
        const next = elModalPasswordNew.value;
        const confirm = elModalPasswordConfirm.value;

        if (!current || !next || !confirm) return;
        if (next !== confirm) {
            elModalPasswordConfirm.focus();
            return;
        }
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({currentPassword: current, newPassword: next})
            });
            const json = await res.json();
            if (!json.result) return;
            closeModal('modal-password');
            showToast('비밀번호가 변경되었습니다.');
        } catch (err) {
            console.error('updatePassword error:', err);
        }
    });
}

/* ----- API ----- */

/* ----- Profile ----- */
async function loadProfile() {
    try {
        const res = await fetch('/api/user/profile', {
            headers: {Authorization: `Bearer ${token}`}
        });
        const json = await res.json();
        if (!json.result) return;
        state.profile = json.data;
        renderProfile();
    } catch (err) {
        console.error('loadProfile error:', err);
    }
}

/* ----- Ingredients ----- */
async function loadIngredients() {
    try {
        const res = await fetch('/api/user/ingredients', {
            headers: {Authorization: `Bearer ${token}`}
        });
        const json = await res.json();
        if (!json.result) return;
        state.ingredients = json.data;
        renderIngredients();
    } catch (err) {
        console.error('loadIngredients error:', err);
    }
}

/* ----- Favorites ----- */
async function loadFavorites() {
    try {
        const res = await fetch('/api/user/favorites', {
            headers: {Authorization: `Bearer ${token}`}
        });
        const json = await res.json();
        if (!json.result) return;
        state.favorites = json.data;
        renderFavorites();
    } catch (err) {
        console.error('loadFavorites error:', err);
    }
}

/* ----- Init ----- */
function init() {
    bindModalEvents();
    bindTabEvents();
    bindIngredientEvents();
    bindFavoriteEvents();
    bindSettingsEvents();
    bindPasswordEvents();
    loadProfile();
    loadIngredients();
    loadFavorites();
}

document.addEventListener('DOMContentLoaded', init);
