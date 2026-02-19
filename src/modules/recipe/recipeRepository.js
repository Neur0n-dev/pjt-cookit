/**
 * Recipe Repository
 *
 * 레시피 DB 쿼리
 * - t_cookit_recipes, t_cookit_recipe_ingredients CRUD
 * - t_cookit_search_history 기록
 */

const db = require('../../config/db');

/**
 * 레시피 저장
 */
async function insertRecipe({
                                recipeUuid,
                                userUuid,
                                recipeIngredients,
                                recipeTitle,
                                recipeDescription,
                                recipeInstructions,
                                cookingTime,
                                cookingDifficulty,
                                llmResponse,
                            }) {
    const sql = `
        INSERT INTO t_cookit_recipes (recipe_uuid, user_uuid, recipe_ingredients, recipe_title,
                                      recipe_description, recipe_instructions, cooking_time,
                                      cooking_difficulty, llm_response)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(sql, [
        recipeUuid, userUuid || null, recipeIngredients, recipeTitle,
        recipeDescription || null, recipeInstructions, cookingTime || null,
        cookingDifficulty || null, JSON.stringify(llmResponse),
    ]);
}

/**
 * 레시피 단건 조회
 */
async function findByRecipeUuid(recipeUuid) {
    const sql = `
        SELECT recipe_uuid,
               user_uuid,
               recipe_ingredients,
               recipe_title,
               recipe_description,
               recipe_instructions,
               cooking_time,
               cooking_difficulty,
               llm_response,
               created_date
        FROM t_cookit_recipes
        WHERE recipe_uuid = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [recipeUuid]);
    return rows[0] || null;
}

/**
 * 레시피 재료 상세 저장 (bulk)
 *
 * 개별 INSERT 대신 VALUES ? 에 2차원 배열을 넘겨 한 번의 쿼리로 전체 삽입.
 * 재료 N개 → DB 왕복 N번 대신 1번으로 처리해 성능 개선.
 * mysql2가 [values] 형태의 2차원 배열을 자동으로 다중 행 INSERT로 변환함.
 */
async function insertRecipeIngredients(recipeUuid, ingredients) {
    if (!ingredients || ingredients.length === 0) return;

    const sql = `
        INSERT INTO t_cookit_recipe_ingredients (ingredient_uuid, recipe_uuid, ingredient_name,
                                                 ingredient_quantity, ingredient_unit)
        VALUES ?
    `;
    const values = ingredients.map(ing => [
        ing.ingredientUuid, recipeUuid, ing.name,
        ing.quantity || null, ing.unit || null,
    ]);
    await db.query(sql, [values]);
}

/**
 * 레시피 재료 상세 조회
 */
async function findIngredientsByRecipeUuid(recipeUuid) {
    const sql = `
        SELECT ingredient_uuid,
               ingredient_name,
               ingredient_quantity,
               ingredient_unit
        FROM t_cookit_recipe_ingredients
        WHERE recipe_uuid = ?
          AND delete_flag = 'N'
    `;
    return await db.query(sql, [recipeUuid]);
}

/**
 * 검색 이력 저장
 */
async function insertSearchHistory({searchSeq, userUuid, searchIngredients, recipeUuid}) {
    const sql = `
        INSERT INTO t_cookit_search_history (search_seq, user_uuid, search_ingredients, recipe_uuid)
        VALUES (?, ?, ?, ?)
    `;
    await db.query(sql, [searchSeq, userUuid || null, searchIngredients, recipeUuid || null]);
}

/**
 * 검색 이력 시퀀스 생성 (SRCH000001 형식)
 */
async function getNextSearchSeq() {
    const sql = `
        SELECT search_seq
        FROM t_cookit_search_history
        ORDER BY search_seq DESC LIMIT 1
    `;
    const rows = await db.query(sql);
    if (rows.length === 0) return 'SRCH000001';

    const lastSeq = rows[0].search_seq;
    const num = parseInt(lastSeq.replace('SRCH', ''), 10) + 1;
    return `SRCH${String(num).padStart(6, '0')}`;
}

module.exports = {
    insertRecipe,
    findByRecipeUuid,
    insertRecipeIngredients,
    findIngredientsByRecipeUuid,
    insertSearchHistory,
    getNextSearchSeq,
};
