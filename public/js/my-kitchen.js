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
const elProfileTier = document.getElementById('profile-tier');
const elProfileNickname = document.getElementById('profile-nickname');
// 통계
const elStatIngredient = document.getElementById('stat-ingredient');
const elStatFavorite = document.getElementById('stat-favorite');
// 대시보드 탭
const elDashboardTabs = document.getElementById('dashboard-tabs');
// 패널
const elPanelIngredients = document.getElementById('panel-ingredients');
const elPanelFavorites = document.getElementById('panel-favorites');
const elPanelSettings = document.getElementById('panel-settings');
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
const elModalIngredient = document.getElementById('modal-ingredient');
const elModalIngredientName = document.getElementById('modal-ingredient-name');
const elModalIngredientQuantity = document.getElementById('modal-ingredient-quantity');
const elModalIngredientUnit = document.getElementById('modal-ingredient-unit');
const elModalIngredientMemo = document.getElementById('modal-ingredient-memo');
const elModalIngredientExpiry = document.getElementById('modal-ingredient-expiry');
const elModalIngredientUuid = document.getElementById('modal-ingredient-uuid');
const elBtnModalIngredientSave = document.getElementById('btn-modal-ingredient-save');
// 즐겨찾기 모달
const elModalFavorite = document.getElementById('modal-favorite');
const elModalFavoriteBody = document.getElementById('modal-favorite-body');
// 삭제 모달
const elModalDelete = document.getElementById('modal-delete');
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
    const {name, nickname, tier} = state.profile;
    elProfileName.textContent = name;
    elProfileTier.textContent = tier;
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
        const quantityText = i.quantity ? ` (${i.quantity}${i.unit || ''})` : '';
        const expiryText = i.expiryDate === '3000-12-31' ? '미정' : i.expiryDate;
        return `
        <div class="ing-item" data-uuid="${i.uuid}">
            <div class="ing-item-info">
                <span class="ing-item-name">${i.name}${quantityText}</span>
                <span class="ing-item-expiry">유통기한: ${expiryText}</span>
                ${i.memo ? `<span class="ing-item-memo">${i.memo}</span>` : ''}
            </div>
            <div class="ing-item-actions">
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
        elFavoriteList.innerHTML = '<p class="panel-empty">즐겨찾기한 레시피가 없습니다.</p>';
        return;
    }

    elFavoriteList.innerHTML = list.map(f => `
        <div class="fav-item" data-uuid="${f.uuid}">
            <div class="fav-item-info">
                <span class="fav-item-title">${f.title}</span>
                ${f.description ? `<span class="fav-item-desc">${f.description}</span>` : ''}
            </div>
            <div class="fav-item-actions">
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
    // 저장
    elBtnSettingsSave.addEventListener('click', () => {
        // TODO: PUT /api/user/profile
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

    // 변경 저장
    elBtnModalPasswordSave.addEventListener('click', () => {
        const current = elModalPasswordCurrent.value;
        const next = elModalPasswordNew.value;
        const confirm = elModalPasswordConfirm.value;

        if (!current || !next || !confirm) return;
        if (next !== confirm) {
            elModalPasswordConfirm.focus();
            return;
        }

        // TODO: PUT /api/user/password
    });
}

/* ----- API ----- */

/* ----- Profile ----- */
async function loadProfile() {
    try {

        const res = await fetch('/api/user/me', {
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
        state.ingredients = json.data
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
        state.favorites = json.data
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
