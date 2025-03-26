import axios from "axios";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const API_URL = "http://localhost:3000/factory"; // Убедись, что сервер запущен
const userPrivateKey = "0x43d7cf353fee06e13ff4405626f63c6042dd2eccad9e684b1c5c6cc1779f7254"; // Приватный ключ пользователя (только для тестов!)
const userAddress = new ethers.Wallet(userPrivateKey).address;


const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
      expiresIn: '12h',
  });
};

const token = generateToken('1234');

// Описание структуры ответа сервера
interface DeployResponse {
    unsignedTransaction: any; // Тут можно уточнить тип, если знаешь структуру транзакции
}

async function testDeployMedicalCard() {
  try {
    console.log("⏳ Запрашиваем неподписанную транзакцию...");

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const response = await axios.post<DeployResponse>(`${API_URL}/deploy-medical-card`, {
      userAddress,
      DID: "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
    });

    console.log("✅ Получена неподписанная транзакция:", response.data);

    let unsignedTx = response.data.unsignedTransaction;
    unsignedTx = {
        ...unsignedTx,
        chainId: 1337,
        gasLimit: ethers.toQuantity(5000000n), // 5,000,000 газа
        gasPrice: ethers.toQuantity(0n),
        maxFeePerGas: ethers.toQuantity(0n),
        maxPriorityFeePerGas: ethers.toQuantity(0n),
    };
    return unsignedTx;
  } catch (error: any) {
    console.error("❌ Ошибка:", error.response?.data || error.message);
  }
}

async function signAndSubmitTransaction(unsignedTx: any) {
  try {
    console.log("\n✍️ Подписываем транзакцию...");

    const wallet = new ethers.Wallet(userPrivateKey);
    const signedTx = await wallet.signTransaction(unsignedTx);

    console.log("✅ Подписанная транзакция:", signedTx);

    // console.log("\n⏳ Отправляем подписанную транзакцию...");
    // const response = await axios.post(`${API_URL}/submit-transaction`, {
    //   signedTransaction: signedTx,
    // });

    // console.log("✅ Транзакция отправлена в блокчейн:", response.data);

    return signedTx;
  } catch (error: any) {
    console.error("❌ Ошибка при отправке транзакции:", error.response?.data || error.message);
  }
}



async function runTests() {
  const unsignedTx = await testDeployMedicalCard();
  
  if (unsignedTx) {
    const signedTx = await signAndSubmitTransaction(unsignedTx);
    if (!signedTx) {  
      return;
    }
    const tx = await ethers.Transaction.from(signedTx);
    console.log('Transaction sent:', tx.hash);
    console.log('Transaction from:', tx.from);
    console.log('Transaction to:', tx.to);
    console.log('Transaction data:', tx.data);
    
  }
}

runTests();
