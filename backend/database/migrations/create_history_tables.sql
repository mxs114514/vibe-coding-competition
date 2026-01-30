-- 菜谱生成历史记录表
CREATE TABLE IF NOT EXISTS recipe_generation_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  ingredients_json TEXT NOT NULL COMMENT '食材列表JSON',
  recipes_count INT NOT NULL COMMENT '生成的菜谱数量',
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_user_generated (user_id, generated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜谱生成历史记录';

-- 历史记录与菜谱关联表
CREATE TABLE IF NOT EXISTS recipe_generation_history_recipes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  history_id BIGINT NOT NULL,
  recipe_id BIGINT NOT NULL,
  FOREIGN KEY (history_id) REFERENCES recipe_generation_history(id) ON DELETE CASCADE,
  FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
  INDEX idx_history (history_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史记录与菜谱关联';
