/**
 * User Service
 *
 * 회원정보 비즈니스 로직
 * - 프로필 수정 검증
 */

const bcrypt = require('bcryptjs');
const {AppError, errorCodes} = require('../../common/errors');
const userRepository = require('./userRepository');

/**
 * 회원 프로필 조회
 */
async function getUserProfile({userUuid}) {
    const row = await userRepository.findByUserUuid(userUuid);
    if (!row) throw new AppError(errorCodes.USER_NOT_FOUND);
    return {
        uuid: row.user_uuid,
        id: row.user_id,
        name: row.user_name,
        nickname: row.user_nickname,
    };
}

/**
 * 회원 프로필 수정
 */
async function updateUserProfile({userUuid, userName, userNickname}) {
    if (!userName || !userName.trim()) {
        throw new AppError(errorCodes.VALIDATION_ERROR);
    }
    if (!userNickname || !userNickname.trim()) {
        throw new AppError(errorCodes.VALIDATION_ERROR);
    }
    await userRepository.updateUserProfile({userUuid, userName, userNickname});
}

/**
 * 회원 비밀번호 변경
 */
async function updateUserPassword({userUuid, currentPassword, newPassword}) {
    const row = await userRepository.findPasswordByUserUuid(userUuid);
    if (!row) throw new AppError(errorCodes.USER_NOT_FOUND);

    const isMatch = await bcrypt.compare(currentPassword, row.user_password);
    if (!isMatch) throw new AppError(errorCodes.PASSWORD_MISMATCH);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updateUserPassword({userUuid, userPassword: hashedPassword});
}

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
};
