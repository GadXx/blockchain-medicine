import express from "express";
import { ethers } from "ethers";
import { connectDB } from "../config/dbMongo.js";
import { ObjectId } from "mongodb";
import MedicalRegistry from "../config/MedicalRegistry.json" assert { type: "json" };

const router = express.Router();
 
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545"); // Подключение к Besu
const contractAddress = "0x0C404C02e771e7e78b7efE2fD534a7275FDd04F7"; // Адрес развернутого контракта

async function getWallet(walletId, password) {
  const db = await connectDB();
  const walletsCollection = db.collection("wallets");
  const walletData = await walletsCollection.findOne({ _id: new ObjectId(walletId) });

  if (!walletData) throw new Error("Кошелек не найден");

  return await ethers.Wallet.fromEncryptedJson(walletData.encryptedWallet, password);
}

router.post("/register-patient", async (req, res) => {
  try {
    const { walletId, password } = req.body;
    if (!walletId || !password) return res.status(400).json({ success: false, message: "walletId и пароль обязательны" });

    const wallet = await getWallet(walletId, password);
    const signer = wallet.connect(provider);
    const contract = new ethers.Contract(contractAddress, MedicalRegistry.abi, signer);

    const tx = await contract.registerPatient();
    await tx.wait();

    res.json({ success: true, message: "Пациент зарегистрирован" });
  } catch (error) {
    console.error("Ошибка регистрации пациента:", error);
    res.status(500).json({ success: false, message: "Ошибка сервера" });
  }
});

export default router;