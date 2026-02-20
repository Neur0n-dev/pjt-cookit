/**
 * Favorites Repository
 *
 * 내 즐겨찾기 DB 쿼리
 * - t_cookit_favorites CRUD
 */

const db = require('../../config/db');

/**
 * 내 즐겨찾기 추가
 */
async function insertFavorite({
                                  favoriteUuid,
                                  userUuid,
                                  recipeUuid,
                              }) {
    const sql = `
        INSERT INTO t_cookit_favorites (favorite_uuid, user_uuid, recipe_uuid)
        VALUES (?, ?, ?)
    `;
    await db.query(sql, [favoriteUuid, userUuid, recipeUuid]);
}

/**
 * 내 즐겨찾기 조회(단건 조회 - 소유권 확인용)
 */
async function findByFavoriteUuid(favoriteUuid) {
    const sql = `
        SELECT favorite_uuid,
               user_uuid
        FROM t_cookit_favorites
        WHERE favorite_uuid = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [favoriteUuid]);
    return rows[0] || null;
}

/**
 * 내 즐겨찾기 목록 조회
 */
async function findAllByUserUuid(userUuid) {
    const sql = `
        SELECT f.favorite_uuid,
               f.recipe_uuid,
               r.recipe_title,
               r.recipe_description,
               r.cooking_time,
               r.cooking_difficulty,
               r.llm_response,
               f.created_date
        FROM t_cookit_favorites f
                 JOIN t_cookit_recipes r ON r.recipe_uuid = f.recipe_uuid
        WHERE f.user_uuid = ?
          AND f.delete_flag = 'N'
          AND r.delete_flag = 'N'
        ORDER BY f.created_date DESC
    `;
    return await db.query(sql, [userUuid]);
}

/**
 * 즐겨찾기 중복 확인 (user + recipe 조합)
 */
async function findByUserAndRecipe(userUuid, recipeUuid) {
    const sql = `
        SELECT favorite_uuid
        FROM t_cookit_favorites
        WHERE user_uuid = ?
          AND recipe_uuid = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [userUuid, recipeUuid]);
    return rows[0] || null;
}

/**
 * 내 즐겨찾기 삭제
 */
async function deleteFavorite({
                                  favoriteUuid,
                                  userUuid,
                              }) {
    const sql = `
        UPDATE t_cookit_favorites
        SET delete_flag = 'Y'
        WHERE favorite_uuid = ?
          AND user_uuid = ?
    `;
    await db.query(sql, [favoriteUuid, userUuid]);
}

module.exports = {
    insertFavorite,
    findByFavoriteUuid,
    findByUserAndRecipe,
    findAllByUserUuid,
    deleteFavorite,
};
