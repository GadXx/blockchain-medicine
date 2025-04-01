import axios from 'axios';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { HDNodeWallet, Mnemonic, Wallet  } from 'ethers';
import { generateMnemonic } from "bip39";

dotenv.config();

const API_URL = "http://localhost:3000";

const generateUserCredentials = () => {
    const email = `user${Math.floor(Math.random() * 1000)}@example.com`;
    const phone = `+380${Math.floor(Math.random() * 1000000000)}`;
    const password = 'password';
    return { email, phone, password };
}

// Генерация случайного набора данных пользователя
const generateAuthCredentials = () => {
    const login = `${Math.floor(Math.random() * 10000)}`;
    const password = 'password';
    return { login, password };
}

const userCredentials = generateUserCredentials();
const ClinicAuth = generateAuthCredentials();
const DoctorAuth = generateAuthCredentials();
const AdminAuth = {
    login: "admin",
    password: "admin"
}

const UserWalletMnemonic = generateMnemonic();
const UserWallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(UserWalletMnemonic));
console.log(UserWallet.address);

const ClinicWalletMnemonic = generateMnemonic();
const ClinicWallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(ClinicWalletMnemonic));
console.log(ClinicWallet.address);

const DoctorWalletMnemonic = generateMnemonic();
const DoctorWallet = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(DoctorWalletMnemonic));
console.log(DoctorWallet.address);

const AdminWallet = new Wallet("0x3ddfdd2c63afe9bf902a74d74645e3500a6513539371d39da60699206a0417ae");

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
    const tokenUser = response.data.token;
    console.log("✅ User logged in, token received:", tokenUser);

    // Set Authorization header for subsequent requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenUser}`;

    // Verify Token
    console.log("⏳ Verifying user...");
    response = await axios.put(`${API_URL}/auth/verify`);
    console.log("✅ Token verified:", response.data);

    const  User_id = response.data._id;

    // Register DID
    console.log("⏳ Registering DID...");
    response = await axios.post(`${API_URL}/did/register-did`, {
      walletAddress: UserWallet.address,
      walletPublicKey: UserWallet.publicKey
    });
    console.log("✅ DID registered:", response.data);

    // Get DID Document
    console.log("⏳ Getting DID document...");
    response = await axios.get(`${API_URL}/did/get-did-document`);
    console.log("✅ DID document received:", response.data);
    const patient_did = response.data.didDocument;

    
    // Register DID in Blockchain
    console.log("⏳ Registering DID in blockchain...");
    response = await axios.post(`${API_URL}/did/register-did-in-blockchain`, {
      DID: patient_did.did,
      walletAddress: UserWallet.address,
    });

    let signedTx = await UserWallet.signTransaction(response.data.unsignedTransaction);

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
    
    signedTx = await UserWallet.signTransaction(response.data.unsignedTransaction);

    // // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Transaction sent:", response.data);

    // // Save Medical Card Address
    console.log("⏳ Saving medical card address...");
    response = await axios.post(`${API_URL}/factory/save-contract-address-patient`);
    console.log("✅ Medical card address saved:", response.data);

    // Get DID Document
    console.log("⏳ Getting DID document...");
    response = await axios.get(`${API_URL}/did/get-did-document`);
    console.log("✅ DID document received:", response.data);


    let message = "Access Medical Records";
    let signature = await UserWallet.signMessage(message);

    // // Get Medical Card
    console.log("⏳ Getting medical card...");
    response = await axios.post(`${API_URL}/medical-card/get-medical-records`, {
        userId: User_id,
        signature
    });
    console.log("✅ Medical card:", response.data);

    // Register Clinic
    console.log("⏳ Registering clinic...");
    response = await axios.post<any>(`${API_URL}/clinic/register`, ClinicAuth);
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

    signedTx = await AdminWallet.signTransaction(response.data.unsignedTransaction);
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
    console.log("✅ Contract address saved for clinic:", response.data.contract_address);

    const ClinicContractAddress = response.data.contract_address;

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

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const iface = new ethers.Interface(["function owner() external view returns (address)"]);
    const data = iface.encodeFunctionData("owner", []);
    
    const ownerResult = await provider.call({
      to: ClinicContractAddress,
      data,
    });
    
    const contractOwner = iface.decodeFunctionResult("owner", ownerResult)[0];
    const signingWallet = await ClinicWallet.getAddress();
    
    console.log("🔍 Владелец контракта:", contractOwner);
    console.log("🔍 Адрес, который подписывает транзакцию:", signingWallet);
    
    if (contractOwner.toLowerCase() !== signingWallet.toLowerCase()) {
      throw new Error("🚨 Ошибка: этот аккаунт не владеет контрактом!");
    }


    // Register Wallet
    console.log("⏳ Registering wallet...");
    response = await axios.post<any>(`${API_URL}/doctor/register-wallet`, {
        walletAddress: DoctorWallet.address,
        walletPublicKey: DoctorWallet.publicKey
    });
    console.log("✅ Wallet registered:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenClinic}`;

    // Register Doctor
    console.log("⏳ Registering doctor...");
    response = await axios.post<any>(`${API_URL}/clinic/register-doctor`, {
        doctorAddress: DoctorWallet.address
    });
    console.log("✅ Doctor registered:", response.data);

    signedTx = await ClinicWallet.signTransaction(response.data.unsignedTransaction);
    console.log("✅ Doctor registered:", signedTx);
    
    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post<any>(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenUser}`

    // Grant Access
    console.log("⏳ Granting access...");
    response = await axios.post(`${API_URL}/medical-card/grant-access`, {
        clinicAddress: ClinicWallet.address,
        clinicContractAddress: ClinicContractAddress
    });
    console.log("✅ Access granted:", response.data);
    let tx = response.data.unsignedTransaction;

    signedTx = await UserWallet.signTransaction(tx);
    console.log("✅ Access granted:", signedTx);

    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post<any>(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);
    
    // Check Access
    console.log("⏳ Checking access...");
    response = await axios.post(`${API_URL}/medical-card/check-access`, {
        clinicAddress: ClinicWallet.address,
        clinicContractAddress: ClinicContractAddress,
        doctorAddress: DoctorWallet.address
    });
    console.log("✅ Access checked:", response.data);
    
    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenDoctor}`;

    message = "Access Medical Records";
    signature = await DoctorWallet.signMessage(message);

    // // Get Medical Card
    console.log("⏳ Getting medical card...");
    response = await axios.post(`${API_URL}/medical-card/get-medical-records`, {
        userId: User_id,
        signature
    });
    console.log("✅ Medical card:", response.data);
    
    // Add Medical Record
    console.log("⏳ Adding medical record...");
    response = await axios.post(`${API_URL}/medical-card/add-medical-record`, {
        userID: User_id,
        ipfsHash: "123"
    });
    console.log("✅ Medical record added:", response.data);

    tx = response.data.unsignedTransaction;

    signedTx = await DoctorWallet.signTransaction(tx);
    console.log("✅ Medical record added:", signedTx);
    
    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post<any>(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);

    // Add Medical Record
    console.log("⏳ Adding medical record...");
    response = await axios.post(`${API_URL}/medical-card/add-medical-record`, {
        userID: User_id,
        ipfsHash: "321"
    });
    console.log("✅ Medical record added:", response.data);

    tx = response.data.unsignedTransaction;

    signedTx = await DoctorWallet.signTransaction(tx);
    console.log("✅ Medical record added:", signedTx);
    
    // Send Signed Transaction
    console.log("⏳ Sending signed transaction...");
    response = await axios.post<any>(`${API_URL}/transaction/send-signed-transaction`, {
        signedTx
    });
    console.log("✅ Signed transaction sent:", response.data);

    message = "Access Medical Records";
    signature = await DoctorWallet.signMessage(message);

    // // Get Medical Card
    console.log("⏳ Getting medical card...");
    response = await axios.post(`${API_URL}/medical-card/get-medical-records`, {
        userId: User_id,
        signature
    });
    console.log("✅ Medical card:", response.data);

    axios.defaults.headers.common["Authorization"] = `Bearer ${tokenUser}`

    message = "Access Medical Records";
    signature = await UserWallet.signMessage(message);

    // // Get Medical Card
    console.log("⏳ Getting medical card...");
    response = await axios.post(`${API_URL}/medical-card/get-medical-records`, {
        userId: User_id,
        signature
    });
    console.log("✅ Medical card:", JSON.stringify(response.data, null, 2));

    

    } catch (error: any) {
        console.error("❌ Error:", error.response?.data || error.message);
    }
}

testAPI();
