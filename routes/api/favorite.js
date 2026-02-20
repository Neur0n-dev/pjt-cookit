/**
 * Favorites API Routes
 *
 * POST   /api/user/favorite     — 추가
 * GET    /api/user/favorite     — 목록 조회
 * DELETE /api/user/favorite/:id — 삭제
 */

const express = require('express');
const router = express.Router();
const {requireAuth} = require('../../src/middleware/auth');
const favoriteController = require('../../src/modules/favorite/favoriteController');

/* ===== 내 즐겨찾기 추가 ===== */
router.post('/favorite', requireAuth, favoriteController.createdMyFavorite);

/* ===== 내 즐겨찾기 목록 조회 ===== */
router.get('/favorite', requireAuth, favoriteController.getMyFavorite);

/* ===== 내 즐겨찾기 삭제 ===== */
router.delete('/favorite/:id', requireAuth, favoriteController.delMyFavorite);

module.exports = router;