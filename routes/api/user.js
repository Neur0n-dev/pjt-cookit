/**
 * User API Routes
 *
 * GET /api/user/profile    - 회원 프로필 조회
 * PUT /api/user/profile    - 회원 프로필 수정
 * PUT /api/user/password   - 회원 비밀번호 변경
 */

var express = require('express');
var router = express.Router();
const {requireAuth} = require('../../src/middleware/auth');
const userController = require('../../src/modules/user/userController');

/* ===== 회원 프로필 조회 ===== */
router.get('/profile', requireAuth, userController.getUserProfile);

/* ===== 회원 프로필 수정 ===== */
router.put('/profile', requireAuth, userController.putUserProfile);

/* ===== 회원 비밀번호 변경 ===== */
router.put('/password', requireAuth, userController.putUserPassword);

module.exports = router;
