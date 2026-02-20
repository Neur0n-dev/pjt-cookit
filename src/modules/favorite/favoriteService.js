/**
 * Favorites Service
 *
 * 내 즐겨찾기 비즈니스 로직
 * - 즐겨찾기 CRUD 처리
 * - 유효성 검증
 */

const crypto = require('crypto');
const {AppError, errorCodes} = require('../../common/errors');
const favoriteRepository = require('./favoriteRepository');
const recipeRepository = require('../recipe/recipeRepository');

/**
 * 내 즐겨찾기 추가
 */
async function createdMyFavorite({userUuid, recipeUuid}) {
    const recipe = await recipeRepository.findByRecipeUuid(recipeUuid);
    if (!recipe) {
        throw new AppError(errorCodes.RECIPE_NOT_FOUND);
    }

    const existing = await favoriteRepository.findByUserAndRecipe(userUuid, recipeUuid);
    if (existing) {
        throw new AppError(errorCodes.DUPLICATE_FAVORITE);
    }

    const favoriteUuid = crypto.randomUUID();

    await favoriteRepository.insertFavorite({
        favoriteUuid,
        userUuid,
        recipeUuid,
    });

    return {favoriteUuid};
}

/**
 * 내 즐겨찾기 목록 조회
 */
async function getMyFavorite({userUuid}) {
    const rows = await favoriteRepository.findAllByUserUuid(userUuid);

    return rows.map(row => {
        const llm = typeof row.llm_response === 'string'
            ? JSON.parse(row.llm_response)
            : (row.llm_response || {});
        return {
            favoriteUuid: row.favorite_uuid,
            recipeUuid: row.recipe_uuid,
            recipeTitle: row.recipe_title,
            recipeDescription: row.recipe_description,
            cookingTime: row.cooking_time,
            cookingDifficulty: row.cooking_difficulty,
            servings: llm.servings || '',
            calories: llm.calories || '',
            tags: llm.tags || [],
            ingredients: (llm.ingredients || []).map(ingredient => ({
                name: ingredient.name,
                quantity: ingredient.quantity || null,
                unit: ingredient.unit || null,
                isRequired: ingredient.isRequired !== false,
            })),
            steps: llm.steps || [],
            tips: llm.tips || '',
            createdDate: row.created_date,
        };
    });
}

/**
 * 내 즐겨찾기 삭제
 */
async function delMyFavorite({favoriteUuid, userUuid}) {
    const favorite = await favoriteRepository.findByFavoriteUuid(favoriteUuid);
    if (!favorite) {
        throw new AppError(errorCodes.FAVORITE_NOT_FOUND);
    }
    if (favorite.user_uuid !== userUuid) {
        throw new AppError(errorCodes.FAVORITE_PERMISSION_DENIED);
    }

    await favoriteRepository.deleteFavorite({
        favoriteUuid,
        userUuid,
    });
}

module.exports = {
    createdMyFavorite,
    getMyFavorite,
    delMyFavorite,
};
