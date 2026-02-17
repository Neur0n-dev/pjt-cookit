/**
 * Auth Repository
 *
 * 인증 관련 DB 쿼리
 * - t_cookit_users CRUD
 * - 아이디/닉네임 중복 조회
 * - 사용자 조회 (로그인)
 */

const db = require('../../config/db');

/**
 * 사용자 등록
 */
async function insertUser({userUuid, userId, userPassword, userName, userNickname}) {
    const sql = `
        INSERT INTO t_cookit_users (user_uuid, user_id, user_password, user_name, user_nickname)
        VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(sql, [userUuid, userId, userPassword, userName, userNickname]);
}

/**
 * 아이디 중복 확인
 * @returns {boolean} 존재하면 true
 */
async function existsByUserId(userId) {
    const sql = `SELECT 1
                 FROM t_cookit_users
                 WHERE user_id = ?
                   AND delete_flag = 'N' LIMIT 1`;
    const rows = await db.query(sql, [userId]);
    return rows.length > 0;
}

/**
 * 닉네임 중복 확인
 * @returns {boolean} 존재하면 true
 */
async function existsByNickname(nickname) {
    const sql = `SELECT 1
                 FROM t_cookit_users
                 WHERE user_nickname = ?
                   AND delete_flag = 'N' LIMIT 1`;
    const rows = await db.query(sql, [nickname]);
    return rows.length > 0;
}

/**
 * 아이디로 사용자 조회
 */
async function findByUserId(userId) {
    const sql = `
        SELECT user_uuid, user_id, user_password, user_name, user_nickname
        FROM t_cookit_users
        WHERE user_id = ?
          AND delete_flag = 'N'
    `;
    const rows = await db.query(sql, [userId]);
    return rows[0] || null;
}

module.exports = {
    insertUser,
    existsByUserId,
    existsByNickname,
    findByUserId,
};