/* ===== Main Page ===== */

/* ----- State ----- */
const state = {
    ingredients: [],        // 입력된 재료 태그 목록
    mode: 'balance',        // 식단 모드 (balance / diet / simple)
    uiCount: 3,             // 추천 개수 (3 / 6 / 9)
    myIngredients: [],      // DB에서 로드한 내 재료 이름 목록
    recipes: [],            // 추천 결과 레시피 배열
    selectedId: null,       // 선택된 레시피 uuid
    rightTab: 'recommend',  // 오른쪽 패널 탭 (recommend / favorite)
    favorites: new Set(),   // 즐겨찾기 uuid Set
    favQuery: '',           // 즐겨찾기 검색어
};

/* ----- DOM ----- */
// 재료 입력
const elTagBox = document.getElementById('tag-box');
const elIngredientInput = document.getElementById('ingredient-input');
// 옵션
const elModeGroup = document.getElementById('mode-group');
const elCountGroup = document.getElementById('count-group');
// 버튼
const elBtnReset = document.getElementById('btn-reset');
const elBtnRecommend = document.getElementById('btn-recommend');
// 상태 메시지
const elStatusText = document.getElementById('status-text');
// 내 재료
const elMyIngredientCount = document.getElementById('my-ingredient-count');
const elBtnMyIngredientReload = document.getElementById('btn-my-ingredient-reload');
const elMyIngredientList = document.getElementById('my-ingredient-list');
// 미리보기 패널
const elPreviewTitle = document.getElementById('preview-title');
const elPreviewSub = document.getElementById('preview-sub');
const elPreviewCount = document.getElementById('preview-count');
const elPreviewTabs = document.getElementById('preview-tabs');
const elFavTab = elPreviewTabs.querySelector('[data-tab="favorite"]');
const elFavCount = document.getElementById('fav-count');
const elFavSearch = document.getElementById('fav-search');
const elFavSearchInput = document.getElementById('fav-search-input');
const elFavSearchClear = document.getElementById('fav-search-clear');
// 요약
const elSummaryCount = document.getElementById('summary-count');
const elSummaryAvgTime = document.getElementById('summary-avg-time');
const elSummaryMissingTop = document.getElementById('summary-missing-top');
// 레시피 카드 리스트
const elPreviewList = document.getElementById('preview-list');
// 상세 레시피
const elDetailSection = document.getElementById('detail-section');
const elDetailSub = document.getElementById('detail-sub');
const elDetailCard = document.getElementById('detail-card');

/* ----- Auth ----- */
const token = localStorage.getItem('token');

/* ----- Helpers ----- */
function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function uniq(arr) {
    return [...new Set((arr || []).filter(Boolean))];
}

function modeLabel(mode) {
    if (mode === 'diet') return '다이어트';
    if (mode === 'simple') return '초간단';
    return '밸런스';
}

function difficultyLabel(d) {
    if (d === 'easy') return '쉬움';
    if (d === 'hard') return '어려움';
    return '보통';
}

function updateStatus(text) {
    elStatusText.textContent = text;
}

// 미리보기 패널 로딩 상태 표시/해제
function setPreviewLoading(isLoading) {
    if (isLoading) {
        elPreviewTitle.textContent = '레시피 생성 중';
        elPreviewSub.textContent = 'AI가 레시피를 분석하고 있어요';
        elPreviewList.innerHTML = `
            <div class="preview-loading">
                <span>🤖 AI가 레시피를 생성하고 있어요...</span>
                <div class="preview-loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>`;
    } else {
        // 로딩 해제 시 현재 state 기준으로 재렌더 (로딩 dots 제거 포함)
        renderPreview();
    }
}

/* ----- Render ----- */

/* ----- Render: Tags ----- */

// 재료 태그 목록 갱신 + 하단 상태 메시지 동기화
function renderTags() {
    elTagBox.querySelectorAll('.tag').forEach(t => t.remove());

    state.ingredients.forEach((name, idx) => {
        const tag = document.createElement('div');
        tag.className = 'tag';
        tag.innerHTML = `
            <span>${escapeHtml(name)}</span>
            <button class="tag-remove" type="button" data-index="${idx}">&times;</button>
        `;
        elTagBox.insertBefore(tag, elIngredientInput);
    });

    elIngredientInput.placeholder = state.ingredients.length === 0
        ? '예: 양파, 돼지고기, 한식, 양식 (Enter로 추가)'
        : '';

    if (state.ingredients.length === 0) {
        updateStatus(`재료를 입력해 주세요. · 모드: ${modeLabel(state.mode)} · 추천 개수: ${state.uiCount}`);
    } else {
        updateStatus(`현재 ${state.ingredients.length}개 재료 입력됨 · 모드: ${modeLabel(state.mode)} · 추천 개수: ${state.uiCount}`);
    }
}

// 재료 1개 추가 (중복/공백 무시)
function addIngredient(name) {
    const v = String(name || '').trim().replace(/\s+/g, ' ');
    if (!v || state.ingredients.includes(v)) return;
    state.ingredients.push(v);
    renderTags();
    renderMyIngredientPickedState();
}

// 쉼표 구분 텍스트 일괄 추가
function addIngredientsFromText(text) {
    const parts = String(text || '')
        .split(/[,，]/g)
        .map(s => s.trim().replace(/\s+/g, ' '))
        .filter(s => s.length > 0 && s.length <= 20);
    if (!parts.length) return;
    state.ingredients = uniq([...state.ingredients, ...parts]);
    renderTags();
    renderMyIngredientPickedState();
}

/* ----- Render: My Ingredients ----- */

// 내 재료 버튼 목록 렌더링
function renderMyIngredients() {
    const list = state.myIngredients || [];
    elMyIngredientCount.textContent = `${list.length}개`;

    if (!list.length) {
        if (!isLoggedIn) {
            elMyIngredientList.innerHTML = '<p class="my-ingredient-empty"><a href="/login">로그인</a>하면 내 재료를 불러올 수 있어요.</p>';
        } else {
            elMyIngredientList.innerHTML = '<p class="my-ingredient-empty">등록된 재료가 없어요. <a href="/my-kitchen">My Kitchen</a>에서 재료를 추가해보세요.</p>';
        }
        return;
    }

    elMyIngredientList.innerHTML = '';
    list.forEach(name => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ing-btn';
        btn.dataset.name = name;
        btn.innerHTML = `<span class="ing-dot"></span>${escapeHtml(name)}`;
        btn.addEventListener('click', () => addIngredient(name));
        elMyIngredientList.appendChild(btn);
    });

    renderMyIngredientPickedState();
}

// 태그 입력과 내 재료 버튼의 active 상태 동기화
function renderMyIngredientPickedState() {
    elMyIngredientList.querySelectorAll('.ing-btn').forEach(btn => {
        btn.classList.toggle('active', state.ingredients.includes(btn.dataset.name));
    });
}

/* ----- Render: Preview ----- */

// 요약 통계 계산 (추천 수 / 평균 조리시간 / 부족 재료 TOP)
function computeSummary(recipes) {
    const count = recipes.length;
    if (count === 0) return {count: 0, avgTime: '-', missingTop: '-'};

    const avg = Math.round(recipes.reduce((acc, r) => acc + (r.cookingTime || 0), 0) / count);
    const freq = {};
    recipes.flatMap(r => r.missingIngredients || []).forEach(m => {
        freq[m] = (freq[m] || 0) + 1;
    });

    let top = '-', max = 0;
    for (const k in freq) {
        if (freq[k] > max) {
            max = freq[k];
            top = k;
        }
    }

    return {count, avgTime: avg ? `${avg}분` : '-', missingTop: top};
}

// 미리보기 카드 하단 부족 재료 텍스트 (필수 미보유 기준)
function missingText(recipe) {
    const miss = recipe.missingIngredients || [];
    if (!miss.length) return '필수 재료 모두 보유';
    return `부족: ${miss.slice(0, 2).join(', ')}${miss.length > 2 ? '…' : ''}`;
}

// 현재 탭/검색어 기준 표시 목록 반환
function getDisplayList() {
    if (state.rightTab === 'recommend') return state.recipes;
    let list = state.recipes.filter(r => state.favorites.has(r.uuid));
    if (state.favQuery) {
        const q = state.favQuery.toLowerCase();
        list = list.filter(r =>
            r.title.toLowerCase().includes(q) ||
            (r.tags || []).some(t => t.toLowerCase().includes(q))
        );
    }
    return list;
}

// 미리보기 패널 전체 렌더링 (탭 / 요약 / 카드 목록)
function renderPreview() {
    // 즐겨찾기 탭: 로그인 시에만 표시
    elFavTab.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (!isLoggedIn && state.rightTab === 'favorite') state.rightTab = 'recommend';

    // 탭 active 상태
    elPreviewTabs.querySelectorAll('.preview-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === state.rightTab);
    });

    // 즐겨찾기 검색창 표시 여부
    elFavSearch.style.display = state.rightTab === 'favorite' ? 'flex' : 'none';
    elFavCount.textContent = String(state.favorites.size);

    // 패널 헤더 텍스트
    if (state.rightTab === 'recommend') {
        elPreviewTitle.textContent = '추천 결과 미리보기';
        elPreviewSub.textContent = '카드 클릭 → 아래 상세로 이동';
    } else {
        elPreviewTitle.textContent = '즐겨찾기';
        elPreviewSub.textContent = state.favQuery
            ? `"${state.favQuery}" 검색 결과`
            : '저장한 레시피만 모아볼 수 있어요';
    }

    // 요약 통계
    const list = getDisplayList();
    const s = computeSummary(list);
    elPreviewCount.textContent = `${list.length}개`;
    elSummaryCount.textContent = `${s.count}개`;
    elSummaryAvgTime.textContent = s.avgTime;
    elSummaryMissingTop.textContent = s.missingTop;

    // 빈 상태
    if (list.length === 0) {
        const msg = state.rightTab === 'favorite'
            ? (state.favQuery
                ? '검색 결과가 없어요.<br>다른 키워드로 검색해보세요.'
                : '아직 <b>즐겨찾기</b>가 없어요.<br>상세 화면에서 즐겨찾기를 눌러 저장해보세요.')
            : '아직 추천 결과가 없어요.<br>왼쪽에서 재료를 입력하고 <b>레시피 추천</b>을 눌러보세요.';
        elPreviewList.innerHTML = `<div class="preview-empty">${msg}</div>`;
        return;
    }

    // 카드 목록
    elPreviewList.innerHTML = '';
    list.forEach(r => {
        const card = document.createElement('div');
        const isActive = r.uuid === state.selectedId;
        const isFav = state.favorites.has(r.uuid);
        card.className = 'recipe-card' + (isActive ? ' active' : '');
        card.dataset.id = r.uuid;
        card.innerHTML = `
            <span class="recipe-card-fav ${isFav ? 'on' : ''}">★</span>
            <div class="recipe-card-top">
                <span class="recipe-card-title">${escapeHtml(r.title)}</span>
                <span class="recipe-card-difficulty">${difficultyLabel(r.difficulty)}</span>
            </div>
            <div class="recipe-card-meta">
                <span class="recipe-card-pill">⏱ ${r.cookingTime || 0}분</span>
                <span class="recipe-card-pill">🍽 ${escapeHtml(r.servings || '')}</span>
                <span class="recipe-card-pill">#${escapeHtml((r.tags || [])[0] || '홈쿡')}</span>
            </div>
            <div class="recipe-card-missing">${missingText(r)}</div>
        `;
        card.addEventListener('click', () => selectRecipe(r.uuid));
        elPreviewList.appendChild(card);
    });
}

// 레시피 선택 → 상세 렌더링 + 스크롤
function selectRecipe(uuid) {
    state.selectedId = uuid;
    renderPreview();
    renderDetail();
    elDetailSection.scrollIntoView({behavior: 'smooth', block: 'start'});
}

// 즐겨찾기 토글
function toggleFavorite(uuid) {
    if (state.favorites.has(uuid)) state.favorites.delete(uuid);
    else state.favorites.add(uuid);
    renderPreview();
    renderDetail();
}

/* ----- Render: Detail ----- */
// 재료 체크리스트 HTML 생성
// isOwned 여부에 따라 초록 체크 스타일 적용
function ingChecklistHtml(list) {
    if (!list.length) return '<li>없음</li>';
    return list.map(i => {
        const amount = [i.quantity, i.unit].filter(Boolean).join('');
        const checkClass = i.isOwned ? 'detail-check-owned' : '';
        return `
            <li>
                <span class="detail-check ${checkClass}"></span>
                ${escapeHtml(i.name)} <small>${escapeHtml(amount)}</small>
            </li>`;
    }).join('');
}

// 상세 레시피 카드 렌더링
// isRequired 기준으로 필수/선택 재료 분리
function renderDetail() {
    const recipe = state.recipes.find(r => r.uuid === state.selectedId);

    if (!recipe) {
        elDetailSub.textContent = '추천 결과에서 카드를 선택해주세요';
        elDetailCard.innerHTML = `
            <div class="detail-empty">
                아직 선택된 레시피가 없습니다.<br>
                위에서 레시피 카드를 클릭하면 상세 정보가 여기에 표시돼요.
            </div>`;
        return;
    }

    const isFav = state.favorites.has(recipe.uuid);
    elDetailSub.textContent = `${escapeHtml(recipe.title)} 상세 정보`;

    // isRequired 기준 분리 (isOwned는 체크 표시용으로 유지)
    const required = (recipe.ingredients || []).filter(i => i.isRequired);
    const optional = (recipe.ingredients || []).filter(i => !i.isRequired);

    // 조리 단계 HTML
    const stepsHtml = (recipe.steps || []).map((step, idx) => `
        <div class="detail-step">
            <span class="detail-step-num">${idx + 1}</span>
            <p class="detail-step-text">${escapeHtml(step)}</p>
        </div>`).join('');

    elDetailCard.innerHTML = `
        <h2 class="detail-title">${escapeHtml(recipe.title)}</h2>
        <div class="detail-meta">
            <span class="detail-pill">⏱ ${recipe.cookingTime || 0}분</span>
            <span class="detail-pill">🍽 ${escapeHtml(recipe.servings || '')}</span>
            <span class="detail-pill">📊 ${difficultyLabel(recipe.difficulty)}</span>
            <span class="detail-pill">🔥 ${escapeHtml(recipe.calories || '-')}</span>
        </div>

        <div class="detail-toolbar">
            <p style="color:#888; font-size:14px;">${escapeHtml(recipe.description || '')}</p>
            <div class="detail-tools">
                <button class="btn-detail ${isFav ? 'btn-detail-primary' : ''}" id="btn-detail-fav" type="button">
                    ${isFav ? '★ 즐겨찾기 해제' : '☆ 즐겨찾기'}
                </button>
            </div>
        </div>

        <hr class="detail-divider">

        <div class="detail-grid">
            <div class="detail-block">
                <h3 class="detail-block-title">⭐ 필수 재료</h3>
                <p class="detail-block-sub">${required.length}가지</p>
                <ul class="detail-checklist">${ingChecklistHtml(required)}</ul>

                ${optional.length ? `
                    <h3 class="detail-block-title" style="margin-top:20px;">🔸 선택 재료</h3>
                    <ul class="detail-checklist">${ingChecklistHtml(optional)}</ul>
                ` : ''}
            </div>

            <div class="detail-block">
                <h3 class="detail-block-title">ℹ️ 요리 정보</h3>
                <div class="detail-info-grid">
                    <div class="detail-info-box">
                        <span class="detail-info-label">조리시간</span>
                        <span class="detail-info-value">${recipe.cookingTime || 0}분</span>
                    </div>
                    <div class="detail-info-box">
                        <span class="detail-info-label">난이도</span>
                        <span class="detail-info-value">${difficultyLabel(recipe.difficulty)}</span>
                    </div>
                    <div class="detail-info-box">
                        <span class="detail-info-label">인분</span>
                        <span class="detail-info-value">${escapeHtml(recipe.servings || '-')}</span>
                    </div>
                    <div class="detail-info-box">
                        <span class="detail-info-label">칼로리</span>
                        <span class="detail-info-value">${escapeHtml(recipe.calories || '-')}</span>
                    </div>
                </div>

                <h3 class="detail-block-title" style="margin-top:20px;">🚨 부족 재료</h3>
                <div class="detail-ing-tags">
                    ${(recipe.missingIngredients || []).length
        ? recipe.missingIngredients.map(name => `<span class="detail-ing-tag missing">${escapeHtml(name)}</span>`).join('')
        : '<span class="detail-ing-tag">필수 재료 모두 보유!</span>'
    }
                </div>
            </div>
        </div>

        ${recipe.tips ? `
        <div class="detail-callout">
            <span class="detail-callout-icon">💡</span>
            <div><b>요리 팁</b><br>${escapeHtml(recipe.tips)}</div>
        </div>
        ` : ''}

        <hr class="detail-divider">

        <h3 class="detail-block-title">👨‍🍳 조리 단계</h3>
        <div class="detail-steps">${stepsHtml}</div>
    `;

    // 즐겨찾기 버튼 이벤트 바인딩
    document.getElementById('btn-detail-fav').addEventListener('click', () => {
        toggleFavorite(recipe.uuid);
    });
}

/* ----- Events ----- */

/* ----- Events: Tag Input ----- */

// Enter / 쉼표 → 재료 추가, Backspace → 마지막 태그 삭제
function bindTagEvents() {
    elIngredientInput.addEventListener('keydown', (e) => {
        if (e.isComposing) return;
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addIngredientsFromText(elIngredientInput.value);
            elIngredientInput.value = '';
        } else if (e.key === 'Backspace') {
            if (elIngredientInput.value.trim() === '' && state.ingredients.length > 0) {
                state.ingredients.pop();
                renderTags();
                renderMyIngredientPickedState();
            }
        }
    });

    // 태그 삭제 버튼 (이벤트 위임)
    elTagBox.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-remove');
        if (!btn) return;
        const idx = Number(btn.dataset.index);
        if (!Number.isNaN(idx)) {
            state.ingredients.splice(idx, 1);
            renderTags();
            renderMyIngredientPickedState();
        }
    });
}

/* ----- Events: Options ----- */

// 식단 모드 / 추천 개수 chip 선택
function bindOptionEvents() {
    elModeGroup.addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        state.mode = chip.dataset.mode;
        elModeGroup.querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', c.dataset.mode === state.mode);
        });
        renderTags();
    });

    elCountGroup.addEventListener('click', (e) => {
        const chip = e.target.closest('.count-chip');
        if (!chip) return;
        state.uiCount = Number(chip.dataset.count);
        elCountGroup.querySelectorAll('.count-chip').forEach(c => {
            c.classList.toggle('active', Number(c.dataset.count) === state.uiCount);
        });
        renderTags();
    });
}

/* ----- Events: My Ingredients ----- */

// 새로고침 버튼 → DB에서 내 재료 재로드
function bindMyIngredientEvents() {
    elBtnMyIngredientReload.addEventListener('click', loadMyIngredients);
}

/* ----- Events: Preview ----- */

// 탭 전환 / 즐겨찾기 검색
function bindPreviewEvents() {
    elPreviewTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.preview-tab');
        if (!tab) return;
        state.rightTab = tab.dataset.tab;
        renderPreview();
        if (state.rightTab === 'favorite') setTimeout(() => elFavSearchInput.focus(), 0);
    });

    elFavSearchInput.addEventListener('input', () => {
        state.favQuery = elFavSearchInput.value;
        renderPreview();
    });

    elFavSearchClear.addEventListener('click', () => {
        state.favQuery = '';
        elFavSearchInput.value = '';
        elFavSearchInput.focus();
        renderPreview();
    });
}

/* ----- Events: Actions ----- */

// 초기화 버튼 / 레시피 추천 버튼 (POST /api/recipe/recommend)
function bindActionEvents() {
    // 초기화: 모든 state 리셋 후 전체 재렌더링
    elBtnReset.addEventListener('click', () => {
        state.ingredients = [];
        state.mode = 'balance';
        state.uiCount = 3;
        state.recipes = [];
        state.selectedId = null;
        state.favorites = new Set();
        state.favQuery = '';
        state.rightTab = 'recommend';

        elModeGroup.querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', c.dataset.mode === 'balance');
        });
        elCountGroup.querySelectorAll('.count-chip').forEach(c => {
            c.classList.toggle('active', Number(c.dataset.count) === 3);
        });
        elFavSearchInput.value = '';

        renderTags();
        renderMyIngredientPickedState();
        renderPreview();
        renderDetail();
    });

    // 레시피 추천: 재료 유효성 확인 후 API 호출
    elBtnRecommend.addEventListener('click', async () => {
        if (state.ingredients.length === 0) {
            updateStatus('재료를 1개 이상 입력해 주세요.');
            elIngredientInput.focus();
            return;
        }

        elBtnRecommend.disabled = true;
        elBtnRecommend.textContent = '⏳ 추천 생성 중...';
        updateStatus('추천을 생성 중입니다…');
        setPreviewLoading(true);

        try {
            const res = await fetch('/api/recipe/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && {Authorization: `Bearer ${token}`}),
                },
                body: JSON.stringify({
                    ingredients: state.ingredients,
                    mode: state.mode,
                    count: state.uiCount,
                }),
            });
            const json = await res.json();
            if (!json.result) {
                updateStatus('추천 생성에 실패했어요. 잠시 후 다시 시도해 주세요.');
                return;
            }
            state.recipes = json.data;
            state.selectedId = state.recipes[0]?.uuid || null;
            state.rightTab = 'recommend';
            renderPreview();
            renderDetail();
            updateStatus('추천 완료! 오른쪽에서 카드를 클릭해보세요.');
        } catch (err) {
            console.error('recommend error:', err);
            updateStatus('추천 생성에 실패했어요. 잠시 후 다시 시도해 주세요.');
        } finally {
            elBtnRecommend.disabled = false;
            elBtnRecommend.textContent = '레시피 추천';
            setPreviewLoading(false);
        }
    });
}

/* ----- API ----- */

/* ----- API: My Ingredients ----- */

// 로그인 상태일 때만 내 재료 로드 (비로그인은 빈 목록 렌더)
async function loadMyIngredients() {
    if (!token) {
        state.myIngredients = [];
        renderMyIngredients();
        return;
    }

    elBtnMyIngredientReload.disabled = true;
    try {
        const res = await fetch('/api/user/ingredients', {
            headers: {Authorization: `Bearer ${token}`},
        });
        const json = await res.json();
        if (!json.result) return;
        state.myIngredients = uniq(
            (json.data || []).map(i => String(i.name || '').trim()).filter(Boolean)
        );
        renderMyIngredients();
    } catch (err) {
        console.error('loadMyIngredients error:', err);
        state.myIngredients = [];
        renderMyIngredients();
    } finally {
        elBtnMyIngredientReload.disabled = false;
    }
}

/* ----- Init ----- */
function init() {
    bindTagEvents();
    bindOptionEvents();
    bindMyIngredientEvents();
    bindPreviewEvents();
    bindActionEvents();
    renderTags();
    renderPreview();
    renderDetail();
    loadMyIngredients();

    // 로그인 상태 변경 시 미리보기 탭 재렌더 (header.js 콜백)
    onLoginStateChange = () => {
        renderPreview();
    };
}

document.addEventListener('DOMContentLoaded', init);
