import mysql from 'mysql2/promise';

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Sjmbahczdszjj666!',
  database: 'momo_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 食材分类映射
const CATEGORY_MAP: { [key: number]: string } = {
  1: '蔬菜',
  2: '肉类',
  3: '海鲜',
  4: '主食',
  5: '调味料',
  6: '其他',
};

// 用户食材状态映射
const STATUS_MAP: { [key: number]: string } = {
  1: '已有',
  2: '缺少',
};

// 查询筛选参数接口
interface UserIngredientFilters {
  status?: number;
  category?: number;
  keyword?: string;
}

// 添加食材数据接口
interface AddIngredientData {
  ingredientId?: number;
  name?: string;
  category?: number;
  amount: number;
  unit?: string;
  status?: number;
}

// 更新食材数据接口
interface UpdateIngredientData {
  amount?: number;
  unit?: string;
  status?: number;
  category?: number;
}

export class UserIngredientService {
  /**
   * 获取用户冰箱食材列表
   */
  async getUserIngredients(userId: number, filters: UserIngredientFilters = {}) {
    const { status, category, keyword } = filters;

    // 构建查询条件
    let sql = `
      SELECT
        ui.id, ui.ingredient_id, ui.amount, ui.unit, ui.status, ui.category,
        i.name
      FROM user_ingredient ui
      JOIN ingredient i ON ui.ingredient_id = i.id
      WHERE ui.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      sql += ' AND ui.status = ?';
      params.push(status);
    }

    if (category) {
      sql += ' AND ui.category = ?';
      params.push(category);
    }

    if (keyword) {
      sql += ' AND i.name LIKE ?';
      params.push(`%${keyword}%`);
    }

    const [rows] = await pool.execute(sql, params);
    const userIngredients = rows as any[];

    // 格式化返回数据
    const list = userIngredients.map((item) => ({
      id: Number(item.id),
      ingredientId: Number(item.ingredient_id),
      name: item.name,
      // 优先使用用户自定义分类，兼容旧数据可能为 null 的情况（虽然已修复）
      category: item.category,
      categoryName: CATEGORY_MAP[item.category] || '未知',
      amount: Number(item.amount),
      unit: item.unit,
      status: item.status,
      statusName: STATUS_MAP[item.status] || '未知',
    }));

    return {
      total: list.length,
      list,
    };
  }

  /**
   * 添加用户食材
   */
  async addUserIngredient(userId: number, data: AddIngredientData) {
    let { ingredientId, name, amount, unit, category } = data;

    // 如果没有 ID 但有名称，尝试查找或创建
    if (!ingredientId && name) {
      const [rows] = await pool.execute('SELECT id, unit FROM ingredient WHERE name = ?', [name]);
      const existingIngredients = rows as any[];

      if (existingIngredients.length > 0) {
        ingredientId = existingIngredients[0].id;
      } else {
        const newCategory = category || 6;
        const [insertResult] = await pool.execute(
          'INSERT INTO ingredient (name, category, unit) VALUES (?, ?, ?)',
          [name, newCategory, unit || '份']
        );
        ingredientId = (insertResult as any).insertId;
      }
    }

    if (!ingredientId) {
      throw new Error('必须提供有效的食材ID或名称');
    }

    // 自动计算状态: amount > 0 为 "1 (AVAILABLE/已有)", amount <= 0 为 "2 (NEEDED/缺少)"
    const status = amount > 0 ? 1 : 2;

    // 检查标准食材是否存在
    const [ingredientRows] = await pool.execute(
      'SELECT id, unit, category FROM ingredient WHERE id = ?',
      [ingredientId]
    );
    const ingredients = ingredientRows as any[];

    if (ingredients.length === 0) {
      throw new Error('标准食材不存在');
    }

    const ingredient = ingredients[0];
    const finalUnit = unit || ingredient.unit;
    // 如果用户未指定分类，使用标准食材的默认分类
    const finalCategory = category || ingredient.category || 6;

    // 创建用户食材记录
    const [result] = await pool.execute(
      'INSERT INTO user_ingredient (user_id, ingredient_id, amount, unit, status, category) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, ingredientId, amount, finalUnit, status, finalCategory]
    );

    const insertResult = result as any;
    const newId = insertResult.insertId;

    // 查询新创建的记录
    const [newRows] = await pool.execute(
      `SELECT ui.id, ui.ingredient_id, ui.amount, ui.unit, ui.status, ui.category, i.name
       FROM user_ingredient ui
       JOIN ingredient i ON ui.ingredient_id = i.id
       WHERE ui.id = ?`,
      [newId]
    );
    const newRecords = newRows as any[];
    const userIngredient = newRecords[0];

    return {
      id: Number(userIngredient.id),
      ingredientId: Number(userIngredient.ingredient_id),
      name: userIngredient.name,
      amount: Number(userIngredient.amount),
      unit: userIngredient.unit,
      status: userIngredient.status,
    };
  }

  /**
   * 批量添加用户食材
   */
  async batchAddUserIngredients(userId: number, ingredients: AddIngredientData[]) {
    let addedCount = 0;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      for (const item of ingredients) {
        const { ingredientId, amount, unit, status = 1 } = item;

        // 检查标准食材是否存在
        const [ingredientRows] = await connection.execute(
          'SELECT id, unit FROM ingredient WHERE id = ?',
          [ingredientId]
        );
        const ingredientRecords = ingredientRows as any[];

        if (ingredientRecords.length === 0) {
          continue; // 跳过不存在的食材
        }

        const ingredient = ingredientRecords[0];
        const finalUnit = unit || ingredient.unit;

        // 创建用户食材记录
        await connection.execute(
          'INSERT INTO user_ingredient (user_id, ingredient_id, amount, unit, status) VALUES (?, ?, ?, ?, ?)',
          [userId, ingredientId, amount, finalUnit, status]
        );

        addedCount++;
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    return { addedCount };
  }

  /**
   * 更新用户食材
   */
  async updateUserIngredient(id: number, userId: number, data: UpdateIngredientData) {
    // 检查食材记录是否存在且属于当前用户
    const [existingRows] = await pool.execute(
      'SELECT id, user_id, ingredient_id FROM user_ingredient WHERE id = ?',
      [id]
    );
    const existingRecords = existingRows as any[];

    if (existingRecords.length === 0) {
      throw new Error('食材记录不存在');
    }

    if (Number(existingRecords[0].user_id) !== userId) {
      throw new Error('无权限操作此食材');
    }

    // 构建更新语句
    const updates: string[] = [];
    const params: any[] = [];

    // 更新分类
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }

    if (data.amount !== undefined) {
      updates.push('amount = ?');
      params.push(data.amount);

      // 自动根据数量计算状态：数量 > 0 为已有(1)，否则为缺少(2)
      const newStatus = data.amount > 0 ? 1 : 2;
      updates.push('status = ?');
      params.push(newStatus);
    }
    if (data.unit) {
      updates.push('unit = ?');
      params.push(data.unit);
    }

    if (updates.length === 0) {
      throw new Error('没有需要更新的字段');
    }

    params.push(id);

    // 更新食材记录
    await pool.execute(`UPDATE user_ingredient SET ${updates.join(', ')} WHERE id = ?`, params);

    // 查询更新后的记录
    const [updatedRows] = await pool.execute(
      `SELECT ui.id, ui.ingredient_id, ui.amount, ui.unit, ui.status, ui.category, i.name
       FROM user_ingredient ui
       JOIN ingredient i ON ui.ingredient_id = i.id
       WHERE ui.id = ?`,
      [id]
    );
    const updatedRecords = updatedRows as any[];
    const updatedIngredient = updatedRecords[0];

    return {
      id: Number(updatedIngredient.id),
      ingredientId: Number(updatedIngredient.ingredient_id),
      name: updatedIngredient.name,
      amount: Number(updatedIngredient.amount),
      unit: updatedIngredient.unit,
      status: updatedIngredient.status,
    };
  }

  /**
   * 删除用户食材
   */
  async deleteUserIngredient(id: number, userId: number) {
    // 检查食材记录是否存在且属于当前用户
    const [existingRows] = await pool.execute(
      'SELECT id, user_id FROM user_ingredient WHERE id = ?',
      [id]
    );
    const existingRecords = existingRows as any[];

    if (existingRecords.length === 0) {
      throw new Error('食材记录不存在');
    }

    if (Number(existingRecords[0].user_id) !== userId) {
      throw new Error('无权限操作此食材');
    }

    // 删除食材记录
    await pool.execute('DELETE FROM user_ingredient WHERE id = ?', [id]);

    return null;
  }

  /**
   * 批量删除用户食材
   */
  async batchDeleteUserIngredients(ids: number[], userId: number) {
    if (ids.length === 0) {
      return { deletedCount: 0 };
    }

    // 检查所有食材记录是否属于当前用户
    const placeholders = ids.map(() => '?').join(',');
    const [existingRows] = await pool.execute(
      `SELECT id, user_id FROM user_ingredient WHERE id IN (${placeholders})`,
      ids
    );
    const existingRecords = existingRows as any[];

    // 验证所有记录都属于当前用户
    const invalidIds = existingRecords.filter((item: any) => Number(item.user_id) !== userId);

    if (invalidIds.length > 0) {
      throw new Error('部分食材记录无权限操作');
    }

    // 批量删除
    const [result] = await pool.execute(
      `DELETE FROM user_ingredient WHERE id IN (${placeholders}) AND user_id = ?`,
      [...ids, userId]
    );

    const deleteResult = result as any;
    return { deletedCount: deleteResult.affectedRows };
  }
}
