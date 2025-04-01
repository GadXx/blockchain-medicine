import { ethers } from "ethers";

// Подключаемся к сети
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Адрес контракта медицинской карты пациента
const medicalCardAddress = "0x3c7D605cBfD2868E5c1687CED0cD5388Ed667264"; // заменить на реальный адрес контракта

// Адрес контракта клиники (если знаешь его заранее)
const clinicAddress = "0xC2FD884F4Cc4A7553B7F473E5051e8a9973Bb070"; // заменить на реальный адрес клиники

// Адрес доктора
const doctorAddress = "0x4930be9779ed9ddad1aab2b2dfb938da6102de4540301888bb1faa8a3e981885"; // заменить на адрес доктора

// ABI контрактов
const medicalCardABI = [
  "function authorizedClinics(address) public view returns (address)"
];

const clinicABI = [
  "function isDoctorRegistered(address) public view returns (bool)"
];

async function checkDoctorAccess() {
  // Создаём экземпляр контракта медицинской карты
  const medicalCardContract = new ethers.Contract(medicalCardAddress, medicalCardABI, provider);
  console.log("Contract ABI:", medicalCardContract);

  const testClinic = await medicalCardContract.authorizedClinics("0x0000000000000000000000000000000000000000");
  console.log("Test Clinic Address:", testClinic);

  try {
    const clinicContractAddress = await medicalCardContract.getAuthorizedClinic(clinicAddress);
    console.log("Clinic Contract Address:", clinicContractAddress);
  } catch (error) {
    console.error("Ошибка вызова authorizedClinics:", error);
  }

  // Получаем адрес контракта клиники
  const clinicContractAddress = await medicalCardContract.getAuthorizedClinic(clinicAddress);


  console.log("Clinic Contract Address:", clinicContractAddress);

  if (clinicContractAddress === ethers.ZeroAddress) {
    console.log("❌ Клиника НЕ добавлена в authorizedClinics!");
    return;
  }

  console.log("✅ Клиника найдена:", clinicContractAddress);

  // Создаём экземпляр контракта клиники
  const clinicContract = new ethers.Contract(clinicContractAddress, clinicABI, provider);

  // Проверяем, зарегистрирован ли доктор
  const isRegistered = await clinicContract.isDoctorRegistered(doctorAddress);

  console.log("Doctor is registered:", isRegistered ? "✅ Да" : "❌ Нет");
}

checkDoctorAccess().catch(console.error);
