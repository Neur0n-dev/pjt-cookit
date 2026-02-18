/**
 * Ingredient API Routes
 *
 * POST   /api/user/ingredients     — 추가
 * GET    /api/user/ingredients     — 목록 조회
 * PUT    /api/user/ingredients/:id — 수정
 * DELETE /api/user/ingredients/:id — 삭제
 */

const express = require('express');
const router = express.Router();
const {requireAuth} = require('../../src/middleware/auth');
const ingredientController = require('../../src/modules/ingredient/ingredientController');

/* ===== 내 재료 추가 ===== */
router.post('/ingredients', requireAuth, ingredientController.createdMyIngredient);

/* ===== 내 재료 목록 조회 ===== */
router.get('/ingredients', requireAuth, ingredientController.getMyIngredients);

/* ===== 내 재료 수정 ===== */
router.put('/ingredients/:id', requireAuth, ingredientController.putMyIngredients);

/* ===== 내 재료 삭제 ===== */
router.delete('/ingredients/:id', requireAuth, ingredientController.delMyIngredients);

module.exports = router;
