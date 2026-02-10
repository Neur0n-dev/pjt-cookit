-- =========================================================
-- 03_constraints.sql
-- 목적: 외래키(FK) 및 추가 제약조건 설정
-- =========================================================

-- ================================
-- t_cookit_users 제약조건
-- ================================
ALTER TABLE t_cookit_users
    ADD CONSTRAINT chk_users_delete_flag CHECK (delete_flag IN ('Y', 'N')),
    ADD CONSTRAINT chk_users_nickname CHECK (user_nickname REGEXP '^[가-힣a-zA-Z0-9]{1,7}$');

-- ================================
-- t_cookit_recipes 제약조건
-- ================================
ALTER TABLE t_cookit_recipes
    ADD CONSTRAINT chk_recipes_delete_flag CHECK (delete_flag IN ('Y', 'N')),
    ADD CONSTRAINT fk_recipes_user FOREIGN KEY (user_uuid)
        REFERENCES t_cookit_users (user_uuid) ON DELETE SET NULL;

-- ================================
-- t_cookit_recipe_ingredients 제약조건
-- ================================
ALTER TABLE t_cookit_recipe_ingredients
    ADD CONSTRAINT chk_recipe_ing_delete_flag CHECK (delete_flag IN ('Y', 'N')),
    ADD CONSTRAINT fk_recipe_ing_recipe FOREIGN KEY (recipe_uuid)
        REFERENCES t_cookit_recipes (recipe_uuid) ON DELETE CASCADE;

-- ================================
-- t_cookit_user_ingredients 제약조건
-- ================================
ALTER TABLE t_cookit_user_ingredients
    ADD CONSTRAINT chk_user_ing_delete_flag CHECK (delete_flag IN ('Y', 'N')),
    ADD CONSTRAINT fk_user_ing_user FOREIGN KEY (user_uuid)
        REFERENCES t_cookit_users (user_uuid) ON DELETE CASCADE;

-- ================================
-- t_cookit_favorites 제약조건
-- ================================
ALTER TABLE t_cookit_favorites
    ADD CONSTRAINT chk_favorites_delete_flag CHECK (delete_flag IN ('Y', 'N')),
    ADD CONSTRAINT fk_favorites_user FOREIGN KEY (user_uuid)
        REFERENCES t_cookit_users (user_uuid) ON DELETE CASCADE,
    ADD CONSTRAINT fk_favorites_recipe FOREIGN KEY (recipe_uuid)
        REFERENCES t_cookit_recipes (recipe_uuid) ON DELETE CASCADE;

-- ================================
-- t_cookit_search_history 제약조건
-- ================================
ALTER TABLE t_cookit_search_history
    ADD CONSTRAINT fk_search_user FOREIGN KEY (user_uuid)
        REFERENCES t_cookit_users (user_uuid) ON DELETE SET NULL,
    ADD CONSTRAINT fk_search_recipe FOREIGN KEY (recipe_uuid)
        REFERENCES t_cookit_recipes (recipe_uuid) ON DELETE SET NULL;
