import axios from 'axios';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { HDNodeWallet, Mnemonic, Wallet  } from 'ethers';
import { generateMnemonic } from "bip39";

dotenv.config();

const API_URL = "http://localhost:3000";

// Генерация случайного набора данных пользователя
const generateAuthCredentials = () => {
    const login = `${Math.floor(Math.random() * 10000)}`;
    const password = 'password';
    return { login, password };
}

const ClinicAuth = {
    login: "clinic",
    password: "clinic"
};
const DoctorAuth = {
    login: "doctor",
    password: "doctor"
};
const AdminAuth = {
    login: "admin",
    password: "admin"
}
const userCredentials = {
    email: 'user@example.com',
    phone: '+380123456781',
    password: 'password'
};

const UserWallet = new Wallet("0xa545f316e31ee67960567a3447f0a824e33f4910016b38f8f6ebbffc72148715");
console.log("✅ UserWallet:",UserWallet.address);
// 0xC354a9ff1289c478B090dC218014B7e370Dbf38A

const ClinicWallet = new Wallet("0xf0c30da2065608c0d7b14c6953cad734c2d96667f8077b500fa8a7950a5031bd");

const DoctorWallet = new Wallet("0x1c5768adba268d3cf33a0865f4cbc38313150f0312b77579847ea0c4e368f401");
console.log("✅ DoctorWallet:",DoctorWallet.address);
// 0xA12537574DDaE37bcC213578d6C7830961a2156A

const AdminWallet = new Wallet("0x3ddfdd2c63afe9bf902a74d74645e3500a6513539371d39da60699206a0417ae");

const testAPI = async () => {
  try {

    // Login User
    console.log("⏳ Logging in user...");
    let response = await axios.post<any>(`${API_URL}/auth/login`, {
      identifier: userCredentials.email,
      password: userCredentials.password
    });
    const UserToken = response.data.token;
    console.log("✅ User logged in, token received:", UserToken);

    const UserID = "67eb22ee81db8fd43f15bc7d";

    axios.defaults.headers.common["Authorization"] = `Bearer ${UserToken}`

    // Get Clinics
    console.log("⏳ Getting clinics...");
    response = await axios.get(`${API_URL}/clinic/get-all-clinics`);
    console.log("✅ Clinics received:", response.data);

    // Grant Access
    console.log("⏳ Granting access...");
    response = await axios.post(`${API_URL}/medical-card/grant-access`, {
        clinicAddress: "0x68FE9A037a18a15fa099276Ae89fa4fd8E3feFc6",
        clinicContractAddress: "0xC2FD884F4Cc4A7553B7F473E5051e8a9973Bb070"
    });
    console.log("✅ Access granted:", response.data);
    let tx = response.data.unsignedTransaction;

    // Sign Transaction
    console.log("⏳ Signing transaction...");
    const signedTx = await UserWallet.signTransaction(tx);
    console.log("✅ Transaction signed:", signedTx);

    console.log(tx);

    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);

    // Lon Doctor
    console.log("⏳ Logging in doctor...");
    response = await axios.post<any>(`${API_URL}/doctor/login`, {
        identifier: DoctorAuth.login,
        password: DoctorAuth.password
    });
    const DoctorToken = response.data.token;
    console.log("✅ Doctor logged in, token received:", DoctorToken);

    axios.defaults.headers.common["Authorization"] = `Bearer ${DoctorToken}`


    const message = "Access Medical Records";
    const signature = await DoctorWallet.signMessage(message);

    // Get Medical Card
    console.log("⏳ Getting medical card...");
    response = await axios.post(`${API_URL}/medical-card/get-medical-records`, {
        userId: UserID,
        signature
    });
    console.log("✅ Medical card:", response.data);

    } catch (error: any) {
        console.error("❌ Error:", error.response?.data || error.message);
    }
}

testAPI();
