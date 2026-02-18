var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var {AppError} = require('./src/common/errors')
var indexRouter = require('./routes/index');

/* ===== API 라우터 ===== */
var authApiRouter = require('./routes/api/auth');
var ingredientApiRouter = require('./routes/api/ingredient');
// var recipeApiRouter = require('./routes/api/recipe');
// var favoriteApiRouter = require('./routes/api/favorite');
// var userApiRouter = require('./routes/api/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

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

/* ===== 페이지 라우터 ===== */
app.use('/', indexRouter);

/* ===== API 라우터 ===== */
app.use('/api/auth', authApiRouter);
app.use('/api/user', ingredientApiRouter);
// app.use('/api', recipeApiRouter);
// app.use('/api', favoriteApiRouter);
// app.use('/api', userApiRouter);

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
    if (req.path.startsWith('/api')) {
        return res.status(err.status || 500).json({
            result: false,
            code: err.code || 1001,
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
