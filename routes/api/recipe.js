/**
 * Recipe API Routes
 *
 * POST /api/recipe/recommend — 레시피 추천
 * GET  /api/recipe/:id       — 레시피 상세 조회
 */

const express = require('express');
const router = express.Router();
const {optionalAuth} = require('../../src/middleware/auth');
const recipeController = require('../../src/modules/recipe/recipeController');

/* ===== 레시피 추천 ===== */
router.post('/recommend', optionalAuth, recipeController.recommend);

/* ===== 레시피 상세 조회 ===== */
router.get('/:id', optionalAuth, recipeController.getDetail);

module.exports = router;
