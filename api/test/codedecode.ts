import CryptoJS from "crypto-js";


// 🔒 Функция для шифрования текста
const encrypt = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

// 🔓 Функция для расшифровки текста
const decrypt = (ciphertext: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export { encrypt, decrypt };