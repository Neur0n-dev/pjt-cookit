/**
 * User Repository
 *
 * 회원정보 DB 쿼리
 * - t_cookit_users CRUD
 */

const db = require("../../config/db");

/**
 * 회원 프로필 조회
 */
async function findByUserUuid(userUuid) {
    const sql = `
        SELECT user_uuid, user_id, user_name, user_nickname
        FROM t_cookit_users
        WHERE user_uuid = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [userUuid]);
    return rows[0] || null;
}

/**
 * 비밀번호 검증용 조회 (user_password 포함)
 */
async function findPasswordByUserUuid(userUuid) {
    const sql = `
        SELECT user_uuid, user_password
        FROM t_cookit_users
        WHERE user_uuid = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [userUuid]);
    return rows[0] || null;
}

/**
 * 회원 프로필 수정
 */
async function updateUserProfile({userUuid, userName, userNickname}) {
    const sql = `
        UPDATE t_cookit_users
        SET user_name     =?,
            user_nickname =?
        WHERE user_uuid = ?
          AND delete_flag = 'N'
    `;
    return await db.query(sql, [userName, userNickname, userUuid]);
}

/**
 * 회원 비밀번호 변경
 */
async function updateUserPassword({userUuid, userPassword}) {
    const sql = `
        UPDATE t_cookit_users
        SET user_password =?
        WHERE user_uuid = ?
          AND delete_flag = 'N'
    `;
    return await db.query(sql, [userPassword, userUuid]);
}

module.exports = {
    findByUserUuid,
    findPasswordByUserUuid,
    updateUserProfile,
    updateUserPassword,
};
