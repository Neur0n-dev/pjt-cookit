/**
 * Validator Middleware
 *
 * 요청 데이터 검증 공통 함수
 */

const {AppError, errorCodes} = require('../common/errors');

/**
 * 필수 필드 검증 미들웨어 생성
 * @param {string[]} fields - 필수 필드명 배열
 * @returns {Function} Express 미들웨어
 *
 * @example
 * router.post('/login', requireFields(['userId', 'password']), authController.login);
 */
function requireFields(fields) {
    return (req, res, next) => {
        const missing = fields.filter(f => {
            const val = req.body[f];
            return val === undefined || val === null || String(val).trim() === '';
        });

        if (missing.length > 0) {
            return next(new AppError(
                errorCodes.VALIDATION_ERROR,
                null,
                missing.map(f => `${f} 항목은 필수입니다.`)
            ));
        }
        next();
    };
}

module.exports = {requireFields};