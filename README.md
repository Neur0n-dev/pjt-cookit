# Cookit

냉장고 속 재료를 입력하면 Google Gemini LLM이 만들 수 있는 요리의 레시피를 추천해주는 웹 서비스.

> Personal Project by Neuron

---

## 주요 기능

- **재료 입력** - 태그 기반 재료 입력 (Enter 추가, Backspace 삭제, 한글 IME 처리)
- **나의 재료** - DB에 등록한 냉장고 재료를 불러와 빠르게 추가
- **레시피 추천** - 식단 모드(밸런스/다이어트/초간단), 추천 개수 선택 후 Gemini API로 추천
- **상세 레시피** - 필수/선택/부족 재료, 조리 단계, 요리 팁, 칼로리 등 상세 정보
- **즐겨찾기** - 마음에 드는 레시피 저장 및 검색, 상세 레시피 팝업으로 바로 확인 (로그인 시)
- **My Kitchen** - 냉장고 재료 관리 (유통기한 포함), 즐겨찾기 레시피 상세 보기, 회원정보 수정

---

## 페이지 구성

| 페이지        | 경로            | 설명                               |
|------------|---------------|----------------------------------|
| 메인         | `/`           | 재료 입력 + 레시피 추천 + 상세 보기           |
| 로그인        | `/login`      | 일반/QR/간편 로그인 (탭 전환)              |
| 회원가입       | `/join`       | 아이디/비밀번호/이름/닉네임 입력 + 중복 확인       |
| 아이디 찾기     | `/find-id`    | 이름으로 아이디 조회                       |
| 비밀번호 찾기    | `/find-pw`    | 아이디 + 이름으로 본인 확인                 |
| 비밀번호 재설정   | `/reset-pw`   | 새 비밀번호 입력 + 확인 (find-pw 경유 필수)  |
| My Kitchen | `/my-kitchen` | 냉장고 재료 관리 + 즐겨찾기 상세 보기 + 회원정보 수정 |

---

## 사용 기술

### Frontend

- EJS (템플릿 엔진)
- Vanilla JS (컴포넌트 분리: header, main, join, find-id, find-pw, reset-pw, my-kitchen)
- CSS (컴포넌트 분리: common, header, footer + 페이지별 CSS)

### Backend

- Node.js + Express 4
- JWT 인증 (jsonwebtoken + bcryptjs)
- Morgan (HTTP 로깅, 커스텀 포맷)
- dotenv 환경 변수 관리

### Database

- MySQL (mysql2/promise)
- 6개 테이블: users, recipes, recipe_ingredients, user_ingredients, favorites, search_history

### AI

- Google Gemini API (추후 연동)

---

## 실행 방법

```bash
# 의존성 설치
npm install

# .env 파일 설정
cp .env.example .env
# .env에서 DB 정보, PORT 등 수정

# 서버 실행 (기본 포트: 3010)
npm start

# 디버그 모드
DEBUG=cookit:* npm start

# PM2로 실행
pm2 start bin/www --name cookit
```

---

## 프로젝트 구조

```
cookit/
├── app.js                          # Express 앱 설정 (미들웨어, 라우터 마운트, 에러 핸들링)
├── bin/www                         # HTTP 서버 진입점 (포트 3010)
├── package.json
│
├── routes/
│   ├── index.js                    # 페이지 라우터 (메인, 사용자관련, 사용자페이지)
│   └── api/
│       ├── auth.js                 # 인증 API (회원가입, 로그인, 아이디/비밀번호 찾기 등)
│       └── ingredient.js           # 내 재료 API (CRUD)
│
├── src/
│   ├── config/
│   │   ├── env.js                  # 환경 변수 중앙 관리
│   │   └── db.js                   # MySQL 커넥션
│   ├── middleware/
│   │   ├── auth.js                 # JWT 검증 미들웨어 (requireAuth, optionalAuth)
│   │   └── validator.js            # 필수 필드 검증 미들웨어
│   ├── modules/
│   │   ├── auth/                   # 인증 모듈 (controller → service → repository)
│   │   └── ingredient/             # 내 재료 모듈 (controller → service → repository)
│   └── common/
│       ├── utils.js                # 공통 유틸
│       └── errors/                 # AppError, errorCodes
│
├── views/
│   ├── pages/
│   │   ├── main.ejs                # 메인 페이지
│   │   ├── login.ejs               # 로그인
│   │   ├── join.ejs                # 회원가입
│   │   ├── find-id.ejs             # 아이디 찾기
│   │   ├── find-pw.ejs             # 비밀번호 찾기
│   │   ├── reset-pw.ejs            # 비밀번호 재설정
│   │   └── my-kitchen.ejs          # 마이키친
│   ├── partials/
│   │   ├── header.ejs              # 공통 헤더
│   │   └── footer.ejs              # 공통 푸터
│   └── error.ejs                   # 에러 페이지
│
├── public/
│   ├── css/                        # 컴포넌트별 CSS (common, header, footer, 페이지별)
│   ├── js/                         # 컴포넌트별 JS (header, 페이지별)
│   └── assets/                     # 이미지 (favicon 등)
│
└── sql/schema/                     # DDL 스크립트
    ├── 01_create_tables.sql
    ├── 02_indexes.sql
    └── 03_constraints.sql
```

---

## API 목록

### 인증 (`/api/auth`)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/auth/register` | 회원가입 | - |
| GET | `/api/auth/check/:field` | 아이디/닉네임 중복 확인 | - |
| POST | `/api/auth/login` | 로그인 (JWT 발급) | - |
| POST | `/api/auth/logout` | 로그아웃 | - |
| GET | `/api/auth/status` | 로그인 상태 확인 | JWT |
| POST | `/api/auth/find-id` | 아이디 찾기 (이름으로 조회) | - |
| POST | `/api/auth/find-pw` | 비밀번호 찾기 (본인 확인) | - |
| POST | `/api/auth/reset-pw` | 비밀번호 재설정 | - |

### 내 재료 / 회원정보 (`/api/user`)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/user/ingredients` | 내 재료 목록 조회 | JWT |
| POST | `/api/user/ingredients` | 재료 추가 | JWT |
| PUT | `/api/user/ingredients/:id` | 재료 수정 | JWT |
| DELETE | `/api/user/ingredients/:id` | 재료 삭제 (soft delete) | JWT |
| GET | `/api/user/me` | 프로필 조회 | JWT |
| PUT | `/api/user/profile` | 회원정보 수정 (이름, 닉네임) | JWT |
| PUT | `/api/user/password` | 비밀번호 변경 | JWT |

---

## 환경 변수 (.env)

| 변수            | 기본값         | 설명      |
|---------------|-------------|---------|
| `NODE_ENV`    | `dev`       | 실행 환경   |
| `PORT`        | `3010`      | 서버 포트   |
| `DB_HOST`     | `localhost` | DB 호스트  |
| `DB_PORT`     | `3306`      | DB 포트   |
| `DB_USER`     | `root`      | DB 사용자  |
| `DB_PASSWORD` | -           | DB 비밀번호 |
| `DB_DATABASE` | `cookit`    | DB 이름   |
| `JWT_SECRET`  | -           | JWT 시크릿 |
| `JWT_EXPIRES_IN` | `1d`     | JWT 만료  |
