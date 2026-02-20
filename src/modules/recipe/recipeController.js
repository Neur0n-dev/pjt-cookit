/**
 * Recipe Controller
 *
 * 레시피 추천 요청/응답 처리
 * - 레시피 추천, 조회
 */

const recipeService = require('./recipeService');

/**
 * POST /api/recipe/recommend — 레시피 추천
 */
async function recommend(req, res, next) {
    try {
        const userUuid = req.user?.userUuid || null;
        const {ingredients, mode, count} = req.body;
        const result = await recipeService.recommendRecipes({
            userUuid,
            ingredients,
            mode,
            count,
        });
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/recipe/:id — 레시피 상세 조회
 */
async function getDetail(req, res, next) {
    try {
        const recipeUuid = req.params.id;
        const userUuid = req.user?.userUuid || null;
        const result = await recipeService.getRecipeDetail(recipeUuid, userUuid);
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    recommend,
    getDetail,
};
