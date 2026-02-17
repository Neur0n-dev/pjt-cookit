/**
 * Auth Middleware
 *
 * JWT 토큰 검증 및 req.user 세팅
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const {AppError, errorCodes} = require('../common/errors');

/**
 * 인증 필수 — 토큰 없거나 유효하지 않으면 401
 */
function requireAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) return next(new AppError(errorCodes.AUTH_REQUIRED));

    try {
        req.user = jwt.verify(token, env.jwt.secret);
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new AppError(errorCodes.TOKEN_EXPIRED));
        }
        return next(new AppError(errorCodes.TOKEN_INVALID));
    }
}

/**
 * 인증 선택 — 토큰 있으면 파싱, 없어도 통과
 */
function optionalAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) return next();

    try {
        req.user = jwt.verify(token, env.jwt.secret);
    } catch (err) {
        // 토큰 유효하지 않아도 무시
    }
    next();
}

/**
 * Authorization 헤더 또는 쿠키에서 토큰 추출
 */
function extractToken(req) {
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
        return auth.slice(7);
    }
    return req.cookies?.token || null;
}

module.exports = {requireAuth, optionalAuth};