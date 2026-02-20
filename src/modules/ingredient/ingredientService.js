/**
 * Ingredient Service
 *
 * 내 재료 비즈니스 로직
 * - 재료 CRUD 처리
 * - 유효성 검증
 */

const crypto = require('crypto');
const {AppError, errorCodes} = require('../../common/errors');
const ingredientRepository = require('./ingredientRepository');

/**
 * 내 재료 추가
 */
async function createdMyIngredient({
                                       userUuid,
                                       ingredientName,
                                       ingredientQuantity,
                                       ingredientUnit,
                                       ingredientMemo,
                                       ingredientExpiryDate
                                   }) {
    if (!ingredientName || !ingredientName.trim()) {
        throw new AppError(errorCodes.VALIDATION_ERROR);
    }

    const ingredientUuid = crypto.randomUUID();
    const expiryDate = ingredientExpiryDate || '3000-12-31';

    await ingredientRepository.insertIngredient({
        ingredientUuid,
        userUuid,
        ingredientName: ingredientName.trim(),
        ingredientQuantity: ingredientQuantity || null,
        ingredientUnit: ingredientUnit || null,
        ingredientMemo: ingredientMemo || null,
        ingredientExpiryDate: expiryDate,
    });

    return {ingredientUuid};
}

/**
 * 내 재료 목록 조회
 */
async function getMyIngredients({userUuid}) {
    const rows = await ingredientRepository.findAllByUserUuid(userUuid);
    return rows.map(row => ({
        uuid: row.ingredient_uuid,
        name: row.ingredient_name,
        quantity: row.ingredient_quantity,
        unit: row.ingredient_unit,
        memo: row.ingredient_memo || '',
        expiryDate: row.ingredient_expiry_date
            ? row.ingredient_expiry_date.toISOString().split('T')[0]
            : '3000-12-31',
        createdDate: row.created_date,
    }));
}

/**
 * 내 재료 수정
 */
async function updateMyIngredients({
                                       userUuid,
                                       ingredientUuid,
                                       ingredientName,
                                       ingredientQuantity,
                                       ingredientUnit,
                                       ingredientMemo,
                                       ingredientExpiryDate,
                                   }) {
    if (!ingredientName || !ingredientName.trim()) {
        throw new AppError(errorCodes.VALIDATION_ERROR);
    }

    const ingredient = await ingredientRepository.findByIngredientUuid(ingredientUuid);
    if (!ingredient) {
        throw new AppError(errorCodes.INGREDIENT_NOT_FOUND);
    }
    if (ingredient.user_uuid !== userUuid) {
        throw new AppError(errorCodes.INGREDIENT_PERMISSION_DENIED);
    }

    await ingredientRepository.updateIngredient({
        userUuid,
        ingredientUuid,
        ingredientName: ingredientName.trim(),
        ingredientQuantity: ingredientQuantity || null,
        ingredientUnit: ingredientUnit || null,
        ingredientMemo: ingredientMemo || null,
        ingredientExpiryDate: ingredientExpiryDate || '3000-12-31',
    });
}

/**
 * 내 재료 삭제
 */
async function deleteMyIngredients({
                                       userUuid,
                                       ingredientUuid,
                                   }) {

    const ingredient = await ingredientRepository.findByIngredientUuid(ingredientUuid);
    if (!ingredient) {
        throw new AppError(errorCodes.INGREDIENT_NOT_FOUND);
    }
    if (ingredient.user_uuid !== userUuid) {
        throw new AppError(errorCodes.INGREDIENT_PERMISSION_DENIED);
    }

    await ingredientRepository.deleteIngredient({
        userUuid,
        ingredientUuid,
    });
}

module.exports = {
    createdMyIngredient,
    getMyIngredients,
    updateMyIngredients,
    deleteMyIngredients,
};
