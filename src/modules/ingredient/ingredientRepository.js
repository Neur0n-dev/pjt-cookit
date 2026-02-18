/**
 * Ingredient Repository
 *
 * 내 재료 DB 쿼리
 * - t_cookit_user_ingredients CRUD
 */

const db = require('../../config/db');

/**
 * 내 재료 추가
 */
async function insertIngredient({
                                    ingredientUuid,
                                    userUuid,
                                    ingredientName,
                                    ingredientQuantity,
                                    ingredientUnit,
                                    ingredientMemo,
                                    ingredientExpiryDate
                                }) {
    const sql = `
        INSERT INTO t_cookit_user_ingredients (ingredient_uuid, user_uuid, ingredient_name, ingredient_quantity,
                                               ingredient_unit, ingredient_memo, ingredient_expiry_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [ingredientUuid, userUuid, ingredientName, ingredientQuantity || null, ingredientUnit || null, ingredientMemo || null, ingredientExpiryDate]);
}

/**
 * 내 재료 조회(단건 조회 - 소유권 확인용)
 */
async function findByIngredientUuid(ingredientUuid) {
    const sql = `
        SELECT ingredient_uuid,
               user_uuid
        FROM t_cookit_user_ingredients
        WHERE ingredient_uuid = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [ingredientUuid]);
    return rows[0] || null;
}

/**
 * 내 재료 목록 조회
 */
async function findAllByUserUuid(userUuid) {
    const sql = `
        SELECT ingredient_uuid,
               ingredient_name,
               ingredient_quantity,
               ingredient_unit,
               ingredient_memo,
               ingredient_expiry_date,
               created_date
        FROM t_cookit_user_ingredients
        WHERE user_uuid = ?
          AND delete_flag = 'N'
        ORDER BY created_date DESC
    `;
    return await db.query(sql, [userUuid]);
}

/**
 * 내 재료 수정
 */
async function updateIngredient({
                                    userUuid,
                                    ingredientUuid,
                                    ingredientName,
                                    ingredientQuantity,
                                    ingredientUnit,
                                    ingredientMemo,
                                    ingredientExpiryDate,
                                }) {
    const sql = `
        UPDATE t_cookit_user_ingredients
        SET ingredient_name        = ?,
            ingredient_quantity    = ?,
            ingredient_unit        = ?,
            ingredient_memo        = ?,
            ingredient_expiry_date = ?
        WHERE ingredient_uuid = ?
          AND user_uuid = ?
          AND delete_flag = 'N'
    `;
    await db.query(sql, [ingredientName, ingredientQuantity || null, ingredientUnit || null, ingredientMemo || null, ingredientExpiryDate, ingredientUuid, userUuid]);
}

/**
 * 내 재료 삭제
 */
async function deleteIngredient({
                                    userUuid,
                                    ingredientUuid,
                                }) {
    const sql = `
        UPDATE t_cookit_user_ingredients
        SET delete_flag = 'Y'
        WHERE ingredient_uuid = ?
          AND user_uuid = ?
    `;
    await db.query(sql, [ingredientUuid, userUuid]);
}

module.exports = {
    insertIngredient,
    findByIngredientUuid,
    findAllByUserUuid,
    updateIngredient,
    deleteIngredient,
};
