/**
 * Recipe Service
 *
 * 레시피 추천 비즈니스 로직
 * - Gemini API 호출 및 응답 파싱
 * - 레시피 CRUD 처리
 */

const crypto = require('crypto');
const {GoogleGenerativeAI} = require('@google/generative-ai');
const env = require('../../config/env');
const {AppError, errorCodes} = require('../../common/errors');
const recipeRepository = require('./recipeRepository');
const ingredientRepository = require('../ingredient/ingredientRepository');
const favoriteRepository = require('../favorite/favoriteRepository');

/**
 * 재료 기반 레시피 추천
 */
async function recommendRecipes({userUuid, ingredients, mode, count}) {
    if (!ingredients || ingredients.length === 0) {
        throw new AppError(errorCodes.INGREDIENTS_REQUIRED);
    }

    const recipeCount = count || 3;
    const prompt = buildPrompt(ingredients, mode, recipeCount);

    let llmResponse;
    try {
        const geminiModel = getModel();
        const result = await geminiModel.generateContent(prompt);
        llmResponse = result.response.text();
    } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(errorCodes.LLM_REQUEST_FAILED, err.message);
    }

    let recipes;
    try {
        recipes = parseRecipeResponse(llmResponse);
    } catch (err) {
        throw new AppError(errorCodes.LLM_PARSE_ERROR, err.message);
    }

    // 보유 재료 목록 결정 (로그인: DB 전체, 비로그인: 전부 없음 처리)
    const ownedNames = userUuid
        ? (await ingredientRepository.findAllByUserUuid(userUuid)).map(r => r.ingredient_name)
        : [];

    // DB 저장 및 응답 생성
    const savedRecipes = [];
    const ingredientsKey = [...ingredients].sort().join(',');

    for (const recipe of recipes) {
        const recipeUuid = crypto.randomUUID();

        await recipeRepository.insertRecipe({
            recipeUuid,
            userUuid: userUuid || null,
            recipeIngredients: ingredientsKey,
            recipeTitle: recipe.title,
            recipeDescription: recipe.description,
            recipeInstructions: recipe.steps.join('\n'),
            cookingTime: recipe.cookingTime,
            cookingDifficulty: recipe.difficulty,
            llmResponse: recipe,
        });

        // 레시피 재료 상세 저장
        const recipeIngredients = (recipe.ingredients || []).map(ingredient => ({
            ingredientUuid: crypto.randomUUID(),
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
        }));
        await recipeRepository.insertRecipeIngredients(recipeUuid, recipeIngredients);

        // 검색 이력 저장
        const searchSeq = await recipeRepository.getNextSearchSeq();
        await recipeRepository.insertSearchHistory({
            searchSeq,
            userUuid: userUuid || null,
            searchIngredients: ingredientsKey,
            recipeUuid,
        });

        // isOwned, missingIngredients 백엔드 계산
        const enrichedIngredients = (recipe.ingredients || []).map(ingredient => ({
            ...ingredient,
            isOwned: ingredient.name ? ownedNames.some(o =>
                o.includes(ingredient.name) || ingredient.name.includes(o)
            ) : false,
        }));
        const missingIngredients = enrichedIngredients
            .filter(ingredient => ingredient.isRequired && !ingredient.isOwned)
            .map(ingredient => ingredient.name);

        savedRecipes.push({
            uuid: recipeUuid,
            title: recipe.title,
            description: recipe.description,
            cookingTime: recipe.cookingTime,
            difficulty: recipe.difficulty,
            mode: mode || 'balance',
            servings: recipe.servings || '',
            calories: recipe.calories || '',
            tags: recipe.tags || [],
            ingredients: enrichedIngredients,
            missingIngredients,
            steps: recipe.steps,
            tips: recipe.tips || '',
        });
    }

    return savedRecipes;
}

/**
 * 레시피 상세 조회
 */
async function getRecipeDetail(recipeUuid, userUuid = null) {
    const recipe = await recipeRepository.findByRecipeUuid(recipeUuid);
    if (!recipe) {
        throw new AppError(errorCodes.RECIPE_NOT_FOUND);
    }

    const llm = typeof recipe.llm_response === 'string'
        ? JSON.parse(recipe.llm_response)
        : recipe.llm_response;

    const isFavorited = userUuid
        ? !!(await favoriteRepository.findByUserAndRecipe(userUuid, recipeUuid))
        : false;
    return {
        uuid: recipe.recipe_uuid,
        title: recipe.recipe_title,
        description: recipe.recipe_description,
        cookingTime: recipe.cooking_time,
        difficulty: recipe.cooking_difficulty,
        servings: llm?.servings || '',
        calories: llm?.calories || '',
        tags: llm?.tags || [],
        ingredients: (llm?.ingredients || []).map(ingredient => ({
            name: ingredient.name,
            quantity: ingredient.quantity || null,
            unit: ingredient.unit || null,
            isRequired: ingredient.isRequired !== false,
        })),
        steps: llm?.steps || [],
        tips: llm?.tips || '',
        createdDate: recipe.created_date,
        isFavorited,
    };
}

/**
 * Gemini 모델 인스턴스
 */
let genAI = null;
let model = null;

function getModel() {
    if (!env.gemini.apiKey) {
        throw new AppError(errorCodes.LLM_API_KEY_MISSING);
    }
    if (!genAI) {
        genAI = new GoogleGenerativeAI(env.gemini.apiKey);
        model = genAI.getGenerativeModel({model: 'gemini-2.5-flash'});
    }
    return model;
}

/**
 * 프롬프트 생성
 */
function buildPrompt(ingredients, mode = 'balance', count) {
    const ingredientList = JSON.stringify(ingredients);

    return `You are a world-class professional chef with expertise in all cuisines — Korean, Chinese, Japanese, Western, Italian, and more.
Your task is to recommend realistic, delicious recipes based on the user's available ingredients.

RESPONSE RULES:
- Output ONLY a valid JSON array. No markdown, no code fences, no extra text.
- All keys in the schema must exist. Use "" for unknown strings, null for unknown numbers, [] for unknown arrays.
- Write title, description, steps, tips, tags entirely in Korean.
- 'difficulty' must be exactly one of: "easy", "medium", "hard".
- 'calories' format: "약 NNNkcal" (e.g. "약 350kcal").
- 'servings' format: "N인분" (e.g. "2인분").
- 'tags': 2~4 short Korean keywords, no '#' (e.g. ["한식", "볶음", "간단"]).
- 'isRequired' in ingredients: true = dish fails without it (core ingredient), false = optional (garnish, sauce, topping, etc.).
PREFERENCE_MODE: "${mode}"
${mode === 'diet' ? '→ Recommend low-calorie, healthy recipes under 400kcal.' : ''}
${mode === 'simple' ? '→ Recommend recipes that can be made within 15 minutes.' : ''}
${mode === 'balance' ? '→ Recommend nutritionally balanced meals.' : ''}

USER_INGREDIENTS: ${ingredientList}

Return exactly ${count} recipes. No fewer.

OUTPUT_SCHEMA:
[
  {
    "title": "string (Korean)",
    "description": "string (Korean, 1 sentence)",
    "cookingTime": 0,
    "difficulty": "easy",
    "servings": "2인분",
    "calories": "약 350kcal",
    "tags": ["string"],
    "ingredients": [
      {"name": "string", "quantity": 0, "unit": "string", "isRequired": true}
    ],
    "steps": ["string (Korean)"],
    "tips": "string (Korean)"
  }
]`;
}

/**
 * Gemini 응답 파싱
 */
function parseRecipeResponse(responseText) {
    // 순수 JSON 우선, 혹시 코드펜스가 붙어 있으면 제거
    let jsonStr = responseText.trim();
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
    }

    const recipes = JSON.parse(jsonStr);

    if (!Array.isArray(recipes)) {
        throw new Error('응답이 배열 형식이 아닙니다.');
    }

    return recipes.map(recipe => ({
        title: recipe.title || '제목 없음',
        description: recipe.description || '',
        cookingTime: parseInt(recipe.cookingTime, 10) || null,
        difficulty: recipe.difficulty || 'medium',
        servings: recipe.servings || '',
        calories: recipe.calories || '',
        tags: recipe.tags || [],
        ingredients: (recipe.ingredients || []).map(ingredient => ({
            name: ingredient.name,
            quantity: ingredient.quantity || null,
            unit: ingredient.unit || null,
            isRequired: ingredient.isRequired !== false,
        })),
        steps: recipe.steps || [],
        tips: recipe.tips || '',
    }));
}

module.exports = {
    recommendRecipes,
    getRecipeDetail,
};
