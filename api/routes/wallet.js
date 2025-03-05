import express from 'express';
import { ethers } from 'ethers';
import { connectDB } from '../config/dbMongo.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// 📌 Создание кошелька с шифрованием
router.post('/create-wallet', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, message: "Пароль обязателен!" });
    }

    const wallet = ethers.Wallet.createRandom(); // Создаем кошелек

    // 🔐 Шифруем с помощью встроенного метода wallet.encrypt
    const encryptedWallet = await wallet.encrypt(password);

    const db = await connectDB();
    const walletsCollection = db.collection("wallets");

    // 📌 Сохраняем в MongoDB
    const walletRecord = await walletsCollection.insertOne({
      address: wallet.address,
      publicKey: wallet.publicKey,
      encryptedWallet, // JSON с зашифрованными данными
      createdAt: new Date()
    });

    // 🔄 Возвращаем пользователю только публичные данные
    res.status(201).json({
      success: true,
      wallet: {
        id: walletRecord.insertedId,
        address: wallet.address,
        publicKey: wallet.publicKey,
      },
      message: "Кошелек успешно создан!"
    });

  } catch (error) {
    console.error("Ошибка при создании кошелька:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

// 📌 Восстановление кошелька по ID и паролю
router.post('/recover-wallet', async (req, res) => {
  try {
    const { walletId, password } = req.body;

    if (!walletId || !password) {
      return res.status(400).json({ success: false, message: "walletId и пароль обязательны!" });
    }

    const db = await connectDB();
    const walletsCollection = db.collection("wallets");

    // 🔍 Ищем кошелек в MongoDB
    const walletData = await walletsCollection.findOne({ _id: new ObjectId(walletId) });

    if (!walletData) {
      return res.status(404).json({ success: false, message: "Кошелек не найден!" });
    }

    // 🔓 Расшифровываем кошелек с паролем
    const decryptedWallet = await ethers.Wallet.fromEncryptedJson(walletData.encryptedWallet, password);

    res.status(200).json({
      success: true,
      message: "Кошелек восстановлен!",
      wallet: {
        address: decryptedWallet.address,
        publicKey: decryptedWallet.publicKey,
        privateKey: decryptedWallet.privateKey, // ⚠️ Показывать осторожно!
      }
    });

  } catch (error) {
    console.error("Ошибка восстановления кошелька:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});


export default router;
