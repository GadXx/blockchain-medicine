import { Wallet } from "ethers";

// Восстанавливаем кошелек из seed-фразы
const wallet = Wallet.createRandom();

console.log("🔑 Закрытый ключ:", wallet.privateKey);
console.log("🔑 Публичный ключ:", wallet.publicKey);
console.log("🏦 Адрес кошелька:", wallet.address);

const encryptedWallet = await wallet.encrypt("password");

console.log(encryptedWallet);


// Расшифровка кошелька
const decryptedWallet = await Wallet.fromEncryptedJson(encryptedWallet, "password");

console.log("🔑 Закрытый ключ:", decryptedWallet.privateKey);
console.log("🔑 Публичный ключ:", decryptedWallet.publicKey);
console.log("🏦 Адрес кошелька:", decryptedWallet.address);