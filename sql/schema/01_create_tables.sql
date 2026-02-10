-- =========================================================
-- 01_create_tables.sql
-- 목적: 테이블 생성 (PK/UK 포함, FK는 03에서 별도 추가)
-- =========================================================

-- 생성 순서 주의: FK는 나중에 걸 예정이라 일단 테이블만 만든다.

DROP TABLE IF EXISTS t_cookit_search_history;
DROP TABLE IF EXISTS t_cookit_favorites;
DROP TABLE IF EXISTS t_cookit_user_ingredients;
DROP TABLE IF EXISTS t_cookit_recipe_ingredients;
DROP TABLE IF EXISTS t_cookit_recipes;
DROP TABLE IF EXISTS t_cookit_users;

-- ================================
-- 사용자 정보 테이블
-- ================================
CREATE TABLE t_cookit_users (
                                user_uuid    VARCHAR(36)  NOT NULL COMMENT '사용자 UUID',
                                user_id      VARCHAR(50)  NOT NULL COMMENT '로그인 ID',
                                user_password VARCHAR(255) NOT NULL COMMENT '해시 비밀번호',
                                user_name    VARCHAR(50)  NOT NULL COMMENT '실명',
                                user_nickname VARCHAR(7)   NOT NULL COMMENT '닉네임 (최대7자, 특수문자X)',
                                delete_flag  CHAR(1)      NOT NULL DEFAULT 'N' COMMENT '삭제여부 (Y/N)',
                                created_date TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
                                updated_date TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
                                PRIMARY KEY (user_uuid),
                                UNIQUE KEY ux_user_id (user_id),
                                UNIQUE KEY ux_user_nickname (user_nickname),
                                KEY ix_users_delete_flag (delete_flag)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='사용자 정보 테이블';

-- ================================
-- 레시피 정보 테이블
-- ================================
CREATE TABLE t_cookit_recipes (
                                  recipe_uuid         VARCHAR(36)  NOT NULL COMMENT '레시피 UUID',
                                  user_uuid           VARCHAR(36)  NULL COMMENT '생성자 UUID (비회원=NULL)',
                                  recipe_ingredients  VARCHAR(500) NOT NULL COMMENT '재료 조합 키 (정렬된 문자열)',
                                  recipe_title        VARCHAR(200) NOT NULL COMMENT '레시피 제목',
                                  recipe_description  TEXT         NULL COMMENT '레시피 설명',
                                  recipe_instructions TEXT         NOT NULL COMMENT '조리 방법',
                                  cooking_time        INT          NULL COMMENT '조리 시간 (분)',
                                  cooking_difficulty  VARCHAR(20)  NULL COMMENT '난이도',
                                  llm_response        JSON         NULL COMMENT 'LLM 원본 응답',
                                  delete_flag         CHAR(1)      NOT NULL DEFAULT 'N' COMMENT '삭제여부 (Y/N)',
                                  created_date        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
                                  updated_date        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
                                  PRIMARY KEY (recipe_uuid),
                                  KEY ix_recipes_ingredients (recipe_ingredients),
                                  KEY ix_recipes_delete_flag (delete_flag)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='레시피 정보 테이블';

-- ================================
-- 레시피 재료 상세 테이블
-- ================================
CREATE TABLE t_cookit_recipe_ingredients (
                                             ingredient_uuid     VARCHAR(36)    NOT NULL COMMENT '재료 UUID',
                                             recipe_uuid         VARCHAR(36)    NOT NULL COMMENT '레시피 UUID (FK)',
                                             ingredient_name     VARCHAR(100)   NOT NULL COMMENT '재료명',
                                             ingredient_quantity DECIMAL(10, 2) NULL COMMENT '수량',
                                             ingredient_unit     VARCHAR(20)    NULL COMMENT '단위 (개, 큰술, g 등)',
                                             delete_flag         CHAR(1)        NOT NULL DEFAULT 'N' COMMENT '삭제여부 (Y/N)',
                                             created_date        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
                                             updated_date        TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
                                             PRIMARY KEY (ingredient_uuid),
                                             KEY ix_recipe_ing_recipe_uuid (recipe_uuid),
                                             KEY ix_recipe_ing_name (ingredient_name),
                                             KEY ix_recipe_ing_delete_flag (delete_flag)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='레시피 재료 상세 테이블';

-- ================================
-- 사용자 냉장고 재료 테이블
-- ================================
CREATE TABLE t_cookit_user_ingredients (
                                           ingredient_uuid        VARCHAR(36)    NOT NULL COMMENT '재료 UUID',
                                           user_uuid              VARCHAR(36)    NOT NULL COMMENT '사용자 UUID (FK)',
                                           ingredient_name        VARCHAR(100)   NOT NULL COMMENT '재료명',
                                           ingredient_quantity    DECIMAL(10, 2) NULL COMMENT '수량',
                                           ingredient_unit        VARCHAR(20)    NULL COMMENT '단위 (개, g, ml 등)',
                                           ingredient_category    VARCHAR(50)    NULL COMMENT '카테고리 (채소, 육류 등)',
                                           ingredient_memo        VARCHAR(200)   NULL COMMENT '메모 (냉동실, 빨리먹기 등)',
                                           ingredient_expiry_date DATE           NOT NULL COMMENT '유통기한 (모르면 3000-12-31)',
                                           delete_flag            CHAR(1)        NOT NULL DEFAULT 'N' COMMENT '삭제여부 (Y/N)',
                                           created_date           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
                                           updated_date           TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
                                           PRIMARY KEY (ingredient_uuid),
                                           KEY ix_user_ing_user_uuid (user_uuid),
                                           KEY ix_user_ing_expiry_date (ingredient_expiry_date),
                                           KEY ix_user_ing_delete_flag (delete_flag)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='사용자 냉장고 재료 테이블';

-- ================================
-- 즐겨찾기 테이블
-- ================================
CREATE TABLE t_cookit_favorites (
                                    favorite_uuid VARCHAR(36) NOT NULL COMMENT '즐겨찾기 UUID',
                                    user_uuid     VARCHAR(36) NOT NULL COMMENT '사용자 UUID (FK)',
                                    recipe_uuid   VARCHAR(36) NOT NULL COMMENT '레시피 UUID (FK)',
                                    delete_flag   CHAR(1)     NOT NULL DEFAULT 'N' COMMENT '삭제여부 (Y/N)',
                                    created_date  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
                                    updated_date  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
                                    PRIMARY KEY (favorite_uuid),
                                    UNIQUE KEY ux_favorites_user_recipe (user_uuid, recipe_uuid),
                                    KEY ix_favorites_user_uuid (user_uuid),
                                    KEY ix_favorites_recipe_uuid (recipe_uuid),
                                    KEY ix_favorites_delete_flag (delete_flag)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='즐겨찾기 테이블';

-- ================================
-- 검색 기록 테이블
-- ================================
CREATE TABLE t_cookit_search_history (
                                         search_seq         VARCHAR(10)  NOT NULL COMMENT '검색 시퀀스 (SRCH000001)',
                                         user_uuid          VARCHAR(36)  NULL COMMENT '사용자 UUID (비회원=NULL)',
                                         search_ingredients VARCHAR(500) NOT NULL COMMENT '검색한 재료 조합',
                                         recipe_uuid        VARCHAR(36)  NULL COMMENT '반환된 레시피 UUID',
                                         created_date       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '검색일시',
                                         PRIMARY KEY (search_seq),
                                         KEY ix_search_user_uuid (user_uuid),
                                         KEY ix_search_created_date (created_date)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
    COMMENT ='검색 기록 테이블';
