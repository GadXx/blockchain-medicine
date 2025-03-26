import axios from "axios";

const API_URL = "http://localhost:3000/factory";
const userAddress = "0x815E5e6A6bA5584491171DAd316D283cf2F149D4"; // Адрес тестового пользователя

interface MedicalCardResponse {
  medicalCardAddress: string;
}

async function testGetMedicalCard() {
  try {
    console.log(`⏳ Запрашиваем адрес медкарты пользователя: ${userAddress}...`);

    const response = await axios.get<MedicalCardResponse>(`${API_URL}/medical-card`, {
      params: { userAddress },
    });

    console.log("✅ Адрес медицинской карты:", response.data);

    if (!response.data.medicalCardAddress || response.data.medicalCardAddress === "0x0000000000000000000000000000000000000000") {
      console.error("❌ Медкарта для этого пользователя не найдена!");
    } else {
      console.log("✅ Медкарта найдена!");
    }
  } catch (error: any) {
    console.error("❌ Ошибка запроса:", error.response?.data || error.message);
  }
}

testGetMedicalCard();
