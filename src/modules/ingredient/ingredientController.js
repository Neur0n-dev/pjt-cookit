/**
 * Ingredient Controller
 *
 * 내 재료 요청/응답 처리
 * - 목록 조회, 추가, 수정, 삭제
 * - 메인 페이지용 재료 목록
 */

const ingredientService = require('./ingredientService');

/**
 * POST /api/user/ingredients — 내 재료 추가
 */
async function createdMyIngredient(req, res, next) {
    try {
        const {userUuid} = req.user;
        const {name, quantity, unit, memo, expiryDate} = req.body;
        const result = await ingredientService.createdMyIngredient({
            userUuid,
            ingredientName: name,
            ingredientQuantity: quantity,
            ingredientUnit: unit,
            ingredientMemo: memo,
            ingredientExpiryDate: expiryDate,
        });
        res.status(201).json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/user/ingredients — 내 재료 목록 조회
 */
async function getMyIngredients(req, res, next) {
    try {
        const {userUuid} = req.user;
        const result = await ingredientService.getMyIngredients({userUuid});
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/user/ingredients — 내 재료 수정
 */
async function putMyIngredients(req, res, next) {
    try {
        const {userUuid} = req.user;
        const ingredientUuid = req.params.id;
        const {name, quantity, unit, memo, expiryDate} = req.body;
        await ingredientService.updateMyIngredients({
            userUuid,
            ingredientUuid,
            ingredientName: name,
            ingredientQuantity: quantity,
            ingredientUnit: unit,
            ingredientMemo: memo,
            ingredientExpiryDate: expiryDate,
        });
        res.json({result: true});
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /api/user/ingredients/:id — 내 재료 삭제
 */
async function delMyIngredients(req, res, next) {
    try {
        const {userUuid} = req.user;
        const ingredientUuid = req.params.id;
        await ingredientService.deleteMyIngredients({
            userUuid,
            ingredientUuid,
        });
        res.json({result: true});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createdMyIngredient,
    getMyIngredients,
    putMyIngredients,
    delMyIngredients,
};
