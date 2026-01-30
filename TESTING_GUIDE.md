# 菜谱功能测试指南

## ✅ 数据库迁移已完成

数据库表已成功创建：
- ✅ `recipe_generation_history` - 历史记录表
- ✅ `recipe_generation_history_recipes` - 历史记录与菜谱关联表

## 🚀 启动服务

### 1. 启动后端服务
```bash
cd backend
npm run dev
```
后端将运行在: http://localhost:8081

### 2. 启动前端服务
```bash
cd frontend
npm run dev
```
前端将运行在: http://localhost:5173

## 📋 功能测试清单

### 前置条件
- [ ] 确保已登录（收藏和历史功能需要登录）
- [ ] 冰箱中已添加一些食材

### 测试场景 1: 生成菜谱并保存
**步骤：**
1. 打开菜谱中心（点击底部导航的"菜谱"按钮）
2. 确保已选择一些食材
3. 点击"🎲 生成菜谱"按钮
4. 等待菜谱生成完成

**预期结果：**
- ✅ 显示生成的菜谱列表（3道菜谱）
- ✅ 每个菜谱卡片显示图片（或加载中状态）
- ✅ 菜谱ID为真实数字ID（不是 temp-xxx 格式）
- ✅ 后端自动保存菜谱到数据库
- ✅ 后端自动创建历史记录

**验证方式：**
```sql
-- 查看保存的菜谱
SELECT id, name, cuisine, created_at FROM recipe ORDER BY id DESC LIMIT 5;

-- 查看历史记录
SELECT * FROM recipe_generation_history ORDER BY id DESC LIMIT 1;
```

---

### 测试场景 2: 收藏菜谱
**步骤：**
1. 在生成的菜谱列表中，找到一个菜谱
2. 点击菜谱卡片右下角的星标按钮

**预期结果：**
- ✅ 星标从空心灰色变为实心黄色 ⭐
- ✅ 无错误提示
- ✅ 收藏状态立即更新

**验证方式：**
```sql
-- 查看收藏记录
SELECT * FROM user_favorite_recipe ORDER BY created_at DESC LIMIT 5;
```

---

### 测试场景 3: 查看收藏列表
**步骤：**
1. 点击"我的收藏"Tab
2. 等待加载完成

**预期结果：**
- ✅ 显示收藏的菜谱列表
- ✅ 显示总数（如"收藏的菜谱 (1道)"）
- ✅ 每个菜谱卡片的星标为实心黄色
- ✅ 显示菜系筛选按钮（全部、中餐、西餐、日韩、东南亚）

---

### 测试场景 4: 按菜系筛选收藏
**步骤：**
1. 在"我的收藏"Tab中
2. 点击不同的菜系筛选按钮（如"中餐"）

**预期结果：**
- ✅ 只显示对应菜系的菜谱
- ✅ 筛选按钮高亮显示（橙色背景）
- ✅ 总数正确更新

---

### 测试场景 5: 取消收藏
**步骤：**
1. 在收藏列表中，点击某个菜谱的星标按钮

**预期结果：**
- ✅ 星标从实心黄色变为空心灰色
- ✅ 菜谱从收藏列表中移除
- ✅ 总数减1

**验证方式：**
```sql
-- 确认收藏记录已删除
SELECT * FROM user_favorite_recipe WHERE recipe_id = {菜谱ID};
```

---

### 测试场景 6: 查看历史记录
**步骤：**
1. 点击"历史记录"Tab
2. 等待加载完成

**预期结果：**
- ✅ 显示生成历史列表
- ✅ 每条记录显示：
  - 生成时间（如"2025/1/30 14:30:00"）
  - 使用的食材列表
  - 生成的菜谱数量
  - 生成的菜谱名称列表
  - "重新生成"按钮

---

### 测试场景 7: 重新生成菜谱
**步骤：**
1. 在"历史记录"Tab中
2. 点击某条历史记录的"重新生成"按钮
3. 等待生成完成

**预期结果：**
- ✅ 自动切换到"生成菜谱"Tab
- ✅ 显示新生成的菜谱列表
- ✅ 使用相同的食材列表
- ✅ 生成的菜谱可能不同（AI随机性）
- ✅ 创建新的历史记录

---

### 测试场景 8: 收藏状态同步
**步骤：**
1. 在"生成菜谱"Tab中收藏一个菜谱
2. 切换到"我的收藏"Tab
3. 再切换回"生成菜谱"Tab

**预期结果：**
- ✅ 收藏列表中显示该菜谱
- ✅ 切换回来后，星标仍为实心黄色
- ✅ 收藏状态在所有Tab间保持一致

---

### 测试场景 9: 未登录时收藏
**步骤：**
1. 退出登录
2. 生成菜谱
3. 点击收藏按钮

**预期结果：**
- ✅ 显示提示"请先登录"
- ✅ 收藏操作未执行

---

### 测试场景 10: 空状态显示
**步骤：**
1. 清空所有收藏
2. 查看"我的收藏"Tab

**预期结果：**
- ✅ 显示空状态图标和提示文字
- ✅ 提示"还没有收藏的菜谱"

**步骤：**
1. 清空历史记录
2. 查看"历史记录"Tab

**预期结果：**
- ✅ 显示空状态图标和提示文字
- ✅ 提示"还没有生成历史"

---

## 🐛 常见问题排查

### 问题1: 收藏时提示"菜谱不存在"
**原因：** 菜谱ID是临时ID，未保存到数据库
**解决：**
- 确保生成菜谱时用户已登录
- 检查后端日志，确认菜谱已保存
- 查询数据库确认菜谱记录存在

### 问题2: 历史记录为空
**原因：** 数据库表未创建或用户未登录
**解决：**
- 确认数据库迁移已执行
- 确保登录后生成菜谱

### 问题3: 收藏状态不同步
**原因：** favoriteIds 未正确更新
**解决：**
- 在 fetchFavorites 时会自动更新 favoriteIds
- 检查浏览器控制台是否有错误

### 问题4: 图片一直显示"生成中"
**原因：** 图片生成失败或轮询未启动
**解决：**
- 检查后端图片生成服务是否正常
- 查看浏览器控制台网络请求
- 检查 recipeStore 的图片轮询逻辑

---

## 📊 数据库查询命令

### 查看最近生成的菜谱
```sql
SELECT id, name, cuisine, difficulty, cooking_time_minutes, created_at
FROM recipe
ORDER BY id DESC
LIMIT 10;
```

### 查看收藏记录
```sql
SELECT ufr.id, ufr.user_id, r.name as recipe_name, ufr.created_at
FROM user_favorite_recipe ufr
JOIN recipe r ON ufr.recipe_id = r.id
ORDER BY ufr.created_at DESC
LIMIT 10;
```

### 查看历史记录
```sql
SELECT h.id, h.user_id, h.ingredients_json, h.recipes_count, h.generated_at,
       GROUP_CONCAT(r.name SEPARATOR ', ') as recipe_names
FROM recipe_generation_history h
LEFT JOIN recipe_generation_history_recipes hr ON h.id = hr.history_id
LEFT JOIN recipe r ON hr.recipe_id = r.id
GROUP BY h.id
ORDER BY h.generated_at DESC
LIMIT 10;
```

### 清空测试数据
```sql
-- 清空收藏记录
DELETE FROM user_favorite_recipe WHERE user_id = {你的用户ID};

-- 清空历史记录
DELETE FROM recipe_generation_history WHERE user_id = {你的用户ID};

-- 清空菜谱（谨慎使用）
-- DELETE FROM recipe WHERE user_id = {你的用户ID};
```

---

## ✅ 测试完成标准

所有测试场景通过后，功能实现完成：
- [x] 生成菜谱自动保存
- [x] 收藏/取消收藏功能正常
- [x] 收藏列表显示和筛选正常
- [x] 历史记录显示正常
- [x] 重新生成功能正常
- [x] 收藏状态同步正常
- [x] 未登录时正确提示
- [x] 空状态显示正常

---

## 📝 测试报告模板

```markdown
## 测试日期: YYYY-MM-DD
## 测试人员: [姓名]

### 测试环境
- 后端: http://localhost:8081
- 前端: http://localhost:5173
- 数据库: MySQL 8.0
- 浏览器: Chrome/Firefox/Safari

### 测试结果
| 场景 | 状态 | 备注 |
|------|------|------|
| 生成菜谱并保存 | ✅/❌ | |
| 收藏菜谱 | ✅/❌ | |
| 查看收藏列表 | ✅/❌ | |
| 按菜系筛选 | ✅/❌ | |
| 取消收藏 | ✅/❌ | |
| 查看历史记录 | ✅/❌ | |
| 重新生成 | ✅/❌ | |
| 收藏状态同步 | ✅/❌ | |
| 未登录提示 | ✅/❌ | |
| 空状态显示 | ✅/❌ | |

### 发现的问题
1. [问题描述]
2. [问题描述]

### 总体评价
[通过/部分通过/未通过]
```
