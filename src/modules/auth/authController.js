/**
 * Auth Controller
 *
 * 인증 관련 요청/응답 처리
 */

const authService = require('./authService');

/**
 * POST /api/auth/register — 회원가입
 */
async function register(req, res, next) {
    try {
        const {userId, password, name, nickname} = req.body;
        const user = await authService.register({
            userId,
            password,
            userName: name,
            userNickname: nickname,
        });
        res.status(201).json({result: true, data: user});
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/auth/check/:field — 중복 확인
 */
async function checkDuplicate(req, res, next) {
    try {
        const {field} = req.params;
        const {value} = req.query;
        const result = await authService.checkDuplicate(field, value);
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/login — 로그인
 */
async function login(req, res, next) {
    try {
        const {userId, password} = req.body;
        const result = await authService.login({userId, password});
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/logout — 로그아웃
 */
async function logout(req, res, next) {
    try {
        const result = await authService.logout();
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    register,
    checkDuplicate,
    login,
    logout,
};