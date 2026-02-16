/**
 * Error Codes
 *
 * 애플리케이션 전역 에러 코드 정의
 * 코드 체계: XXXX
 *   - 1XXX: 공통 에러
 *   - 2XXX: 인증 에러
 *   - 3XXX: 검증 에러
 *   - 4XXX: 리소스 에러
 */

module.exports = {
    // ================================
    // 공통 에러 (1XXX)
    // ================================
    INTERNAL_ERROR: {
        code: 1001,
        status: 500,
        message: '서버 내부 오류가 발생했습니다.'
    },

    // ================================
    // 인증 에러 (2XXX)
    // ================================
    AUTH_FAILED: {
        code: 2001,
        status: 401,
        message: '아이디 또는 비밀번호가 일치하지 않습니다.'
    },
    AUTH_REQUIRED: {
        code: 2002,
        status: 401,
        message: '로그인이 필요합니다.'
    },
    TOKEN_EXPIRED: {
        code: 2003,
        status: 401,
        message: '인증이 만료되었습니다. 다시 로그인해주세요.'
    },
    TOKEN_INVALID: {
        code: 2004,
        status: 401,
        message: '유효하지 않은 인증 정보입니다.'
    },

    // ================================
    // 검증 에러 (3XXX)
    // ================================
    VALIDATION_ERROR: {
        code: 3001,
        status: 400,
        message: '입력값이 올바르지 않습니다.'
    },
    DUPLICATE_USER_ID: {
        code: 3002,
        status: 409,
        message: '이미 사용 중인 아이디입니다.'
    },
    DUPLICATE_NICKNAME: {
        code: 3003,
        status: 409,
        message: '이미 사용 중인 닉네임입니다.'
    },
    PASSWORD_MISMATCH: {
        code: 3004,
        status: 400,
        message: '비밀번호가 일치하지 않습니다.'
    },

    // ================================
    // 리소스 에러 (4XXX)
    // ================================
    NOT_FOUND: {
        code: 4001,
        status: 404,
        message: '요청한 리소스를 찾을 수 없습니다.'
    },
    USER_NOT_FOUND: {
        code: 4002,
        status: 404,
        message: '해당 사용자를 찾을 수 없습니다.'
    },
    RECIPE_NOT_FOUND: {
        code: 4003,
        status: 404,
        message: '해당 레시피를 찾을 수 없습니다.'
    },
    DUPLICATE_FAVORITE: {
        code: 4004,
        status: 409,
        message: '이미 즐겨찾기에 추가된 레시피입니다.'
    },
};
