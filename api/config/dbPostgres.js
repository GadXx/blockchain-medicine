import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT),
});

const createTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        verified BOOLEAN DEFAULT false,
        medical_record_address VARCHAR(100) DEFAULT NULL
      );
    `);
    console.log("✅ Таблица users успешно создана или уже существует!");
  } catch (error) {
    console.error("❌ Ошибка при создании таблицы:", error.message);
  }
};

// Запускаем создание таблицы при старте
createTable();

export default pool;
