/**
 * Auth Service
 *
 * 인증 비즈니스 로직
 * - 회원가입 (해싱, 중복 확인, 저장)
 * - 로그인 (비밀번호 검증, JWT 발급)
 * - 중복 확인
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const {AppError, errorCodes} = require('../../common/errors');
const authRepository = require('./authRepository');

/**
 * JWT 토큰 생성
 */
function generateToken(user) {
    return jwt.sign(
        {userUuid: user.user_uuid, userId: user.user_id, userName: user.user_name, userNickname: user.user_nickname},
        env.jwt.secret,
        {expiresIn: env.jwt.expiresIn}
    );
}

/**
 * 회원가입
 */
async function register({userId, password, userName, userNickname}) {
    if (await authRepository.existsByUserId(userId)) {
        throw new AppError(errorCodes.DUPLICATE_USER_ID);
    }
    if (await authRepository.existsByNickname(userNickname)) {
        throw new AppError(errorCodes.DUPLICATE_NICKNAME);
    }

    const userUuid = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(password, 10);

    await authRepository.insertUser({
        userUuid,
        userId,
        userPassword: hashedPassword,
        userName,
        userNickname,
    });

    return {userUuid, userId, userName, userNickname};
}

/**
 * 중복 확인 (아이디 또는 닉네임)
 */
async function checkDuplicate(field, value) {
    let exists = false;
    if (field === 'userId') {
        exists = await authRepository.existsByUserId(value);
    } else if (field === 'nickname') {
        exists = await authRepository.existsByNickname(value);
    }
    return {available: !exists};
}

/**
 * 로그인
 */
async function login({userId, password}) {
    const user = await authRepository.findByUserId(userId);
    if (!user) {
        throw new AppError(errorCodes.AUTH_FAILED);
    }

    const isMatch = await bcrypt.compare(password, user.user_password);
    if (!isMatch) {
        throw new AppError(errorCodes.AUTH_FAILED);
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            userUuid: user.user_uuid,
            userId: user.user_id,
            userName: user.user_name,
            userNickname: user.user_nickname,
        },
    };
}

/**
 * 로그아웃
 */
async function logout() {
    return {
        message: '로그아웃 성공! 홈경로로 이동합니다.',
    };
}

module.exports = {
    register,
    checkDuplicate,
    login,
    logout,
};