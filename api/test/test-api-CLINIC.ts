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

const ClinicAuth = generateAuthCredentials();
const DoctorAuth = generateAuthCredentials();
const AdminAuth = {
    login: "admin",
    password: "admin"
}

const ClinicWalletMnemonic = generateMnemonic();
const ClinicWallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(ClinicWalletMnemonic));

const DoctorWalletMnemonic = generateMnemonic();
const DoctorWallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(DoctorWalletMnemonic));

const AdminWallet = new Wallet("0x3ddfdd2c63afe9bf902a74d74645e3500a6513539371d39da60699206a0417ae");

const testAPI = async () => {
  try {
    
    // Register Clinic
    console.log("⏳ Registering clinic...");
    let response = await axios.post<any>(`${API_URL}/clinic/register`, ClinicAuth);
    console.log("✅ Clinic registered:", response.data);

    const Clinic = response.data.clinic;
    
    // Login Clinic
    console.log("⏳ Logging in clinic...");
    response = await axios.post(`${API_URL}/clinic/login`, {
      identifier: ClinicAuth.login,
      password: ClinicAuth.password
    });
    const tokenClinic = response.data.token;
    console.log("✅ Clinic logged in, token received:", tokenClinic);

    // Login Admin
    console.log("⏳ Logging in admin...");
    response = await axios.post(`${API_URL}/admin/login`, {
      identifier: AdminAuth.login,
      password: AdminAuth.password
    });
    
    const tokenAdmin = response.data.token;
    console.log("✅ Admin logged in, token received:", tokenAdmin);

    // Set Authorization header for subsequent requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenAdmin}`;
    
    // Verify Clinic
    console.log("⏳ Verifying clinic...");
    response = await axios.put(`${API_URL}/clinic/verify`, {
        clinicID: Clinic._id
    });
    console.log("✅ Clinic verified:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenClinic}`;

    // Register Wallet
    console.log("⏳ Registering wallet...");
    response = await axios.post<any>(`${API_URL}/clinic/register-wallet`, {
        walletAddress: ClinicWallet.address,
        walletPublicKey: ClinicWallet.publicKey
    });
    console.log("✅ Wallet registered:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenAdmin}`;

    // Grant Access Clinic
    console.log("⏳ Granting access to clinic...");
    response = await axios.post<any>(`${API_URL}/factory/add-clinic-deployer`, {
        clinicID: Clinic._id
    });
    console.log("✅ Access granted:", response.data);

    let signedTx = await AdminWallet.signTransaction(response.data.unsignedTransaction);
    console.log("✅ Clinic deployed:", signedTx);
    
    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post<any>(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenClinic}`;

    // Deploy Clinic
    console.log("⏳ Deploying clinic...");
    response = await axios.post<any>(`${API_URL}/factory/deploy-clinic`);
    
    signedTx = await ClinicWallet.signTransaction(response.data.unsignedTransaction);
    console.log("✅ Clinic deployed:", signedTx);
    
    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post<any>(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);

    // Save Contract Address Clinic
    console.log("⏳ Saving contract address for clinic...");
    response = await axios.post<any>(`${API_URL}/factory/save-contract-address-clinic`);
    console.log("✅ Contract address saved for clinic:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenClinic}`;

    // Register Doctor
    console.log("⏳ Registering doctor...");
    response = await axios.post<any>(`${API_URL}/doctor/register`, DoctorAuth);
    console.log("✅ Doctor registered:", response.data);

    const Doctor = response.data.doctor;

    // Login Doctor
    console.log("⏳ Logging in doctor...");
    response = await axios.post(`${API_URL}/doctor/login`, {
      identifier: DoctorAuth.login,
      password: DoctorAuth.password
    });
    const tokenDoctor = response.data.token;
    console.log("✅ Doctor logged in, token received:", tokenDoctor);

    // Set Authorization header for subsequent requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenDoctor}`;

    // Register Wallet
    console.log("⏳ Registering wallet...");
    response = await axios.post<any>(`${API_URL}/doctor/register-wallet`, {
        walletAddress: DoctorWallet.address,
        walletPublicKey: DoctorWallet.publicKey
    });
    console.log("✅ Wallet registered:", response.data);



    } catch (error: any) {
        console.error("❌ Error:", error.response?.data || error.message);
    }
}

testAPI();
