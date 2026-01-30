import mysql from 'mysql2/promise';

async function migrate() {
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

  try {
    const connection = await pool.getConnection();
    console.log('Database connected.');

    // 1. Check if column exists
    console.log('Checking if category column exists in user_ingredient...');
    const [columns] = await connection.execute(`SHOW COLUMNS FROM user_ingredient LIKE 'category'`);

    if ((columns as any[]).length === 0) {
      console.log('Column not found. Adding category column...');
      // 2. Add column
      await connection.execute(
        `ALTER TABLE user_ingredient ADD COLUMN category INT DEFAULT NULL COMMENT '用户自定义分类'`
      );
      console.log('Column added.');

      // 3. Migrate data from ingredient table
      console.log('Migrating data from ingredient table...');
      await connection.execute(
        `UPDATE user_ingredient ui 
         JOIN ingredient i ON ui.ingredient_id = i.id 
         SET ui.category = i.category`
      );
      console.log('Data migration completed.');
    } else {
      console.log('Column already exists. Skipping migration.');
    }

    connection.release();
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
