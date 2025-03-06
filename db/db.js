const { Pool } = require('pg');

// Створення пулу з'єднань
const pool = new Pool({
  host: process.env.DB_HOST,         // Отримуємо значення з .env
  port: process.env.DB_PORT,         // Отримуємо значення з .env
  user: process.env.DB_USER,         // Отримуємо значення з .env
  password: process.env.DB_PASSWORD, // Отримуємо значення з .env
  database: process.env.DB_NAME,     // Отримуємо значення з .env
  max: 10,                           // Максимальна кількість з'єднань в пулі (можна налаштувати)
  idleTimeoutMillis: 30000,          // Час в мс, після якого неактивні з'єднання будуть закриватись
  connectionTimeoutMillis: 2000      // Час в мс на установку з'єднання
});


module.exports = pool;