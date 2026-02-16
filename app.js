var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var {AppError} = require('./src/common/errors')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// TODO cookit 페이지 router 나중에 변경 해야되나?
app.get('/', (req, res) => res.render('pages/main')); // 메인 페이지
app.get('/login', (req, res) => res.render('pages/login')); // 로그인 페이지
app.get('/join', (req, res) => res.render('pages/join')); // 회원가입 페이지
app.get('/find-id', (req, res) => res.render('pages/find-id')); // 아이디 찾기 페이지
app.get('/find-pw', (req, res) => res.render('pages/find-pw')); // 비밀전호 찾기 페이지
app.get('/reset-pw', (req, res) => res.render('pages/reset-pw')); // 비밀전호 찾기 페이지
app.get('/my-kitchen', (req, res) => res.render('pages/my-kitchen')); // 마이키친 페이지
app.get('/my-kitchen2', (req, res) => res.render('pages/my-kitchen2')); // 마이키친 페이지 (레거시)

// app.use(logger('dev'));
app.use(logger(function (tokens, req, res) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    return [
        timestamp,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms -',
        tokens.res(req, res, 'content-length')
    ].join(' ');
}));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// API error handler
app.use(function (err, req, res, next) {
    // AppError인 경우 JSON 응답
    if (err instanceof AppError) {
        return res.status(err.status).json(err.toJSON());
    }

    // API 요청인 경우 JSON 에러 응답
    if (req.path.startsWith('/')) {
        return res.status(err.status || 500).json({
            result: false,
            code: err.code || 1003,
            message: err.message || '서버 내부 오류가 발생했습니다.'
        });
    }

    // 그 외 (view 렌더링)
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'dev' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
