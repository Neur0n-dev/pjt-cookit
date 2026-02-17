/**
 * Auth API Routes
 *
 * POST /api/auth/register — 회원가입
 * GET  /api/auth/check/:field — 중복 확인(ID / 닉네임)
 * POST /api/auth/login — 로그인
 */

var express = require('express');
var router = express.Router();
var {requireFields} = require('../../src/middleware/validator');
var authController = require('../../src/modules/auth/authController');

/* ===== 회원가입 ===== */
router.post('/register', requireFields(['userId', 'password', 'name', 'nickname']), authController.register);

/* ===== 중복 확인 ===== */
router.get('/check/:field', authController.checkDuplicate);

/* ===== 로그인 ===== */
router.post('/login', requireFields(['userId', 'password']), authController.login);

module.exports = router;