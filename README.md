# Cookit

냉장고 속 재료를 입력하면 Google Gemini LLM이 만들 수 있는 요리의 레시피를 추천해주는 웹 서비스.

> Personal Project by Neuron

---

## 주요 기능

- **재료 입력** - 태그 기반 재료 입력 (Enter 추가, Backspace 삭제, 한글 IME 처리)
- **나의 재료** - DB에 등록한 냉장고 재료를 불러와 빠르게 추가
- **레시피 추천** - 식단 모드(밸런스/다이어트/초간단), 추천 개수 선택 후 Gemini API로 추천
- **상세 레시피** - 필수/선택/부족 재료, 조리 단계, 요리 팁, 칼로리 등 상세 정보
- **즐겨찾기** - 마음에 드는 레시피 저장 및 검색 (로그인 시)
- **My Kitchen** - 냉장고 재료 관리 (추후)

---

## 페이지 구성

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 메인 | `/` | 재료 입력 + 레시피 추천 + 상세 보기 |
| 로그인 | `/login` | 로그인/회원가입 (추후) |
| My Kitchen | `/my-kitchen` | 냉장고 재료 관리 (추후) |

---

## 사용 기술

### Frontend
- EJS (템플릿 엔진)
- Vanilla JS (모듈 분리: header.js, main.js)
- CSS (컴포넌트 분리: common, header, footer, main)

### Backend
- Node.js + Express 4
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
├── app.js                          # Express 앱 설정
├── bin/www                         # HTTP 서버 진입점 (포트 3010)
├── package.json
│
├── src/
│   ├── config/
│   │   ├── env.js                  # 환경 변수 중앙 관리
│   │   └── db.js                   # MySQL 커넥션
│   └── common/
│       ├── utils.js                # 공통 유틸
│       └── errors/                 # AppError, errorCodes
│
├── views/
│   ├── pages/
│   │   ├── main.ejs                # 메인 페이지
│   │   ├── login.ejs               # 로그인 (추후)
│   │   └── my-kitchen.ejs          # 마이키친 (추후)
│   ├── partials/
│   │   ├── header.ejs              # 공통 헤더
│   │   └── footer.ejs              # 공통 푸터
│   └── error.ejs                   # 에러 페이지
│
├── public/
│   ├── css/
│   │   ├── common.css              # 리셋, 베이스
│   │   ├── header.css              # 헤더
│   │   ├── footer.css              # 푸터
│   │   └── main.css                # 메인 페이지
│   ├── js/
│   │   ├── header.js               # 헤더 로직 (로그인 상태)
│   │   └── main.js                 # 메인 페이지 로직
│   └── assets/                     # 이미지 (favicon 등)
│
└── sql/schema/                     # DDL 스크립트
    ├── 01_create_tables.sql
    ├── 02_indexes.sql
    └── 03_constraints.sql
```

---

## 환경 변수 (.env)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `NODE_ENV` | `dev` | 실행 환경 |
| `PORT` | `3010` | 서버 포트 |
| `DB_HOST` | `localhost` | DB 호스트 |
| `DB_PORT` | `3306` | DB 포트 |
| `DB_USER` | `root` | DB 사용자 |
| `DB_PASSWORD` | - | DB 비밀번호 |
| `DB_DATABASE` | `cookit` | DB 이름 |
