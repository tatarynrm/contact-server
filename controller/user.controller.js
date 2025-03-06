const pool = require("../db/db");

class UserController {
  // Перевірка наявності користувача
  static async getUserById(tgId) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        "SELECT * FROM bot_users WHERE tg_id = $1",
        [tgId]
      );
      if (rows.length === 0) {
        return null; // Користувач не знайдений
      }
      return rows[0]; // Повертаємо знайденого користувача
    } catch (err) {
      console.error("Error getting user", err.stack);
      throw err; // Викидаємо помилку для подальшої обробки
    } finally {
      client.release(); // Завжди випускаємо клієнта після запиту
    }
  }

  // Додавання нового користувача
  static async addUser(tgId, username) {
    const client = await pool.connect();
    try {
      // Перевірка чи є вже користувач з таким tg_id
      const existingUser = await UserController.getUserById(tgId);
      if (existingUser) {
        return null;
      }

      // Додавання нового користувача
      const dateBegin = new Date(); // Поточна дата та час
      await client.query(
        "INSERT INTO bot_users (username, date_begin, tg_id) VALUES ($1, $2, $3)",
        [username, dateBegin, tgId]
      );

      console.log("New user added");
    } catch (err) {
      console.error("Error adding user", err.stack);
      throw err; // Викидаємо помилку для подальшої обробки
    } finally {
      client.release(); // Завжди випускаємо клієнта після запиту
    }
  }

  // Оновлення даних користувача
  static async updateUser(tgId, newUsername) {
    const client = await pool.connect();
    try {
      const existingUser = await UserController.getUserById(tgId);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Оновлення імені користувача
      await client.query(
        "UPDATE bot_users SET username = $1 WHERE tg_id = $2",
        [newUsername, tgId]
      );

      console.log("User updated");
    } catch (err) {
      console.error("Error updating user", err.stack);
      throw err; // Викидаємо помилку для подальшої обробки
    } finally {
      client.release(); // Завжди випускаємо клієнта після запиту
    }
  }

  // Видалення користувача
  static async deleteUser(tgId) {
    const client = await pool.connect();
    try {
      const existingUser = await UserController.getUserById(tgId);
      if (!existingUser) {
        throw new Error("User not found");
      }

      // Видалення користувача з таблиці
      await client.query("DELETE FROM bot_user_status WHERE tg_id = $1", [
        tgId,
      ]);

      console.log("User deleted");
    } catch (err) {
      console.error("Error deleting user", err.stack);
      throw err; // Викидаємо помилку для подальшої обробки
    } finally {
      client.release(); // Завжди випускаємо клієнта після запиту
    }
  }

  // Отримання всіх користувачів
  static async getAllUsers() {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT * FROM bot_user_status");
      return rows; // Повертаємо всі записи
    } catch (err) {
      console.error("Error fetching users", err.stack);
      throw err; // Викидаємо помилку для подальшої обробки
    } finally {
      client.release(); // Завжди випускаємо клієнта після запиту
    }
  }
}

module.exports = UserController;
