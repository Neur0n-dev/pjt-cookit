/**
 * Favorites Controller
 *
 * 내 즐겨찾기 요청/응답 처리
 * - 목록 조회, 추가, 삭제
 */

const favoriteService = require('./favoriteService');

/**
 * POST /api/user/favorite — 내 즐겨찾기 추가
 */
async function createdMyFavorite(req, res, next) {
    try {
        const {userUuid} = req.user;
        const {recipeUuid} = req.body;
        const result = await favoriteService.createdMyFavorite({userUuid, recipeUuid});
        res.status(201).json({result: true, favoriteUuid: result.favoriteUuid});
    } catch (err) {
        next(err);
    }
}

/**
 * GET /api/user/favorite — 내 즐겨찾기 목록 조회
 */
async function getMyFavorite(req, res, next) {
    try {
        const {userUuid} = req.user;
        const result = await favoriteService.getMyFavorite({userUuid});
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /api/user/favorite/:id — 내 즐겨찾기 삭제
 */
async function delMyFavorite(req, res, next) {
    try {
        const {userUuid} = req.user;
        const favoriteUuid = req.params.id;
        await favoriteService.delMyFavorite({
            favoriteUuid,
            userUuid,
        });
        res.json({result: true});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createdMyFavorite,
    getMyFavorite,
    delMyFavorite,
};