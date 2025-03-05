import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import pool from '../config/dbPostgres.js';

const router = express.Router();

// 🔑 Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// 📌 Регистрация пользователя
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Все поля обязательны" });
    }

    // Проверяем, есть ли уже такой пользователь
    const existingUser = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: "Номер уже зарегистрирован" });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя в БД
    const newUser = await pool.query(
      'INSERT INTO users (phone, password, verified, medical_record_address) VALUES ($1, $2, $3, $4) RETURNING id',
      [phone, hashedPassword, false, null]
    );

    res.status(201).json({
      success: true,
      message: "Пользователь зарегистрирован!",
      userId: newUser.rows[0].id
    });

  } catch (error) {
    console.error("Ошибка регистрации:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// 🔐 Авторизация пользователя
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ success: false, message: "Заполните все поля" });
    }

    const user = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (user.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Пользователь не найден" });
    }

    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Неверный пароль" });
    }

    // Генерируем JWT-токен
    const token = jwt.sign(
      { id: user.rows[0].id },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ success: true, message: "Авторизация успешна", token });

  } catch (error) {
    console.error("Ошибка авторизации:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// 📌 Получение профиля пользователя
router.get('/profile/:id', async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ success: false, message: "Нет токена" });
    }

    // Проверяем JWT
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);

    // Проверяем, совпадает ли ID запрашиваемого профиля с ID пользователя в токене
    if (decoded.id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Нет доступа к этому профилю" });
    }

    const user = await pool.query('SELECT id, phone, verified, medical_record_address FROM users WHERE id = $1', [req.params.id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Пользователь не найден" });
    }

    res.json({ success: true, user: user.rows[0] });

  } catch (error) {
    console.error("Ошибка при получении профиля:", error);
    res.status(401).json({ success: false, message: "Ошибка при обработке токена" });
  }
});

// ✅ Верификация пользователя
router.post('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ success: false, message: "Нет токена" });
    }

    // Проверяем JWT
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);

    const { phone, verificationCode } = req.body;

    if (!phone || !verificationCode) {
      return res.status(400).json({ success: false, message: "Все поля обязательны" });
    }

    const user = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);

    if (user.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Пользователь не найден" });
    }

    if (decoded.id.toString() !== user.rows[0].id.toString()) {
      return res.status(403).json({ success: false, message: "Нет доступа к этому профилю" });
    }

    // Проверяем код (пока просто "777")
    if (verificationCode !== "777") {
      return res.status(400).json({ success: false, message: "Неверный код верификации" });
    }

    await pool.query('UPDATE users SET verified = true WHERE phone = $1', [phone]);

    res.json({ success: true, message: "Пользователь успешно верифицирован!" });

  } catch (error) {
    console.error("Ошибка при верификации:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// 📌 Регистрация кошелька и привязка его к пользователю
router.post('/register-wallet', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Токен не предоставлен!" });
    }

    // 📌 Получаем сам токен без "Bearer "
    const token = authHeader.split(" ")[1];

    // Декодируем JWT и получаем ID пользователя
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, message: "Недействительный токен!" });
    }

    const verified_starus = await pool.query('SELECT verified FROM users WHERE id = $1', [decoded.id]);
    if (verified_starus.rows[0].verified === false) {
      return res.status(400).json({ success: false, message: "Пользователь не верифицирован!" });
    }

    const user = await pool.query('SELECT medical_record_address FROM users WHERE id = $1', [decoded.id]);
    if (user.rows[0].medical_record_address !== null) {
      return res.status(400).json({ success: false, message: "Кошелек уже зарегистрирован!" });
    }

    const userId = decoded.id;

    // ⚡ Отправляем запрос на создание кошелька
    const walletResponse = await fetch('http://localhost:3000/api/create-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const walletData = await walletResponse.json();

    if (!walletData.success) {
      return res.status(500).json({ success: false, message: "Ошибка при создании кошелька" });
    }

    const walletId = walletData.wallet.id;

    // 📌 Обновляем medical_record_address в базе данных
    await pool.query('UPDATE users SET medical_record_address = $1 WHERE id = $2', [walletId, userId]);

    res.json({
      success: true,
      message: "Кошелек зарегистрирован и привязан к пользователю!",
      wallet: walletData.wallet
    });

  } catch (error) {
    console.error("Ошибка регистрации кошелька:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

export default router;
