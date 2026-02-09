# PJT-cookit

레시피 추천 개인 프로젝트
(Node.js + Express 기반 백엔드 프로젝트)

---

## 프로젝트 소개

**PJT-cookit**는 내가 가지고 있는 재료를 입력하면
구글 LLM을 통해 만들 수 있는 요리의 레시피를 알려주는 프로젝트

---

## 사용 기술

### 백엔드
- Node.js + Express
- EJS (템플릿 엔진)

### 데이터베이스
- MySQL (mysql2/promise)
- Repository 패턴 적용

### 기타
- dotenv 환경 변수 관리
- Morgan (HTTP 로깅)

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 서버 실행 (기본 포트: 3000)
npm start

# 디버그 모드 실행
DEBUG=cookit:* npm start

# 포트 변경
PORT=8080 npm start
```

---

## 프로젝트 구조

```
cookit/
├── app.js              # Express 앱 설정 (미들웨어, 라우트 마운트, 에러 핸들링)
├── bin/www             # HTTP 서버 진입점
├── routes/             # Express 라우터
│   ├── index.js        # / 경로
│   └── users.js        # /users 경로
├── views/              # EJS 템플릿
│   ├── index.ejs
│   └── error.ejs
└── public/             # 정적 파일
    └── stylesheets/
        └── style.css
```
