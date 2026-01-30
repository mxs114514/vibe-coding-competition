import mysql from 'mysql2/promise';

async function checkAndFix() {
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

    // Check for NULL categories
    const [rows] = await connection.execute(
      `SELECT count(*) as count FROM user_ingredient WHERE category IS NULL`
    );
    const count = (rows as any[])[0].count;
    console.log(`Found ${count} rows with NULL category.`);

    if (count > 0) {
      console.log('Fixing NULL categories...');
      await connection.execute(
        `UPDATE user_ingredient ui 
         JOIN ingredient i ON ui.ingredient_id = i.id 
         SET ui.category = i.category
         WHERE ui.category IS NULL`
      );
      console.log('Fixed.');
    }

    connection.release();
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkAndFix();
