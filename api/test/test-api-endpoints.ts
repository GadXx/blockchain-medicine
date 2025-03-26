import axios from 'axios';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { HDNodeWallet, Mnemonic  } from 'ethers';
import { generateMnemonic } from "bip39";

dotenv.config();

const API_URL = "http://localhost:3000";

// Генерация случайного набора данных пользователя
const generateUserCredentials = () => {
    const email = `user${Math.floor(Math.random() * 1000)}@example.com`;
    const phone = `+380${Math.floor(Math.random() * 1000000000)}`;
    const password = 'password';
    return { email, phone, password };
}

const userCredentials = generateUserCredentials();

const testAPI = async () => {
  try {
    // Register User
    console.log("⏳ Registering user...");
    let response = await axios.post<any>(`${API_URL}/auth/register`, userCredentials);
    console.log("✅ User registered:", response.data);

    // Login User
    console.log("⏳ Logging in user...");
    response = await axios.post(`${API_URL}/auth/login`, {
      identifier: userCredentials.email,
      password: userCredentials.password
    });
    const token = response.data.token;
    console.log("✅ User logged in, token received:", token);

    // Set Authorization header for subsequent requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Generate Mnemonic
    const mnemonic = generateMnemonic();
    console.log("✅ Mnemonic generated:", mnemonic);
    
    const mn =  Mnemonic.fromPhrase(mnemonic);
    const wallet = HDNodeWallet.fromMnemonic(mn);

    // Register DID
    console.log("⏳ Registering DID...");
    response = await axios.post(`${API_URL}/did/register-did`, {
      encryptedMnemonic: mnemonic
    });
    console.log("✅ DID registered:", response.data);

    // Get DID Document
    console.log("⏳ Getting DID document...");
    response = await axios.get(`${API_URL}/did/get-did-document`);
    console.log("✅ DID document received:", response.data);

    // Register DID in Blockchain
    console.log("⏳ Registering DID in blockchain...");
    response = await axios.post(`${API_URL}/did/register-did-in-blockchain`);

    const WW = new ethers.Wallet(wallet.privateKey);
    let signedTx = await WW.signTransaction(response.data.unsignedTransaction);

    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Transaction sent:", response.data);

    // // Deploy Medical Card
    console.log("⏳ Deploying medical card...");
    response = await axios.post(`${API_URL}/factory/deploy-medical-card`);
    console.log("✅ Medical card deployment transaction:", response.data);
    
    signedTx = await WW.signTransaction(response.data.unsignedTransaction);

    // // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Transaction sent:", response.data);

    // // Save Medical Card Address
    console.log("⏳ Saving medical card address...");
    response = await axios.post(`${API_URL}/factory/save-contract-address`);
    console.log("✅ Medical card address saved:", response.data);

    // Get DID Document
    console.log("⏳ Getting DID document...");
    response = await axios.get(`${API_URL}/did/get-did-document`);
    console.log("✅ DID document received:", response.data);


    const message = "Access Medical Records";
    const signature = await WW.signMessage(message);

    // // Get Medical Card
    console.log("⏳ Getting medical card...");
    response = await axios.post(`${API_URL}/medical-card/get-medical-records`, {
            signature
    });
    console.log("✅ Medical card:", response.data);


    } catch (error: any) {
        console.error("❌ Error:", error.response?.data || error.message);
    }
}

testAPI();
