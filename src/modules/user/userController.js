/**
 * User Controller
 *
 * 회원정보 요청/응답 처리
 * - 프로필 조회, 수정, 비밀번호 변경
 */

const userService = require('./userService');

/**
 * GET /api/user/profile - 회원 프로필 조회
 */
async function getUserProfile(req, res, next) {
    try {
        const {userUuid} = req.user;
        const result = await userService.getUserProfile({userUuid});
        res.json({result: true, data: result});
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/user/profile - 회원 프로필 수정
 */
async function putUserProfile(req, res, next) {
    try {
        const {userUuid} = req.user;
        const {name, nickname} = req.body;
        await userService.updateUserProfile({userUuid, userName: name, userNickname: nickname});
        res.json({result: true});
    } catch (err) {
        next(err);
    }
}

/**
 * PUT /api/user/password - 회원 비밀번호 변경
 */
async function putUserPassword(req, res, next) {
    try {
        const {userUuid} = req.user;
        const {currentPassword, newPassword} = req.body;
        await userService.updateUserPassword({userUuid, currentPassword, newPassword});
        res.json({result: true});
    } catch (err) {
        next(err);
    }
}

module.exports = {
    getUserProfile,
    putUserProfile,
    putUserPassword,
};
