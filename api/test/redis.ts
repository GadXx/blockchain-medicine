import { redis } from "../src/config/Redis";

// Сохранение данных в Redis
const setKey = async (): Promise<void> => {
  await redis.set("user:1", JSON.stringify({ id: "zxc", name: "Alice" }), "EX", 3600);
  console.log("Данные сохранены в Redis");
};

// Получение данных из Redis
const getKey = async (): Promise<void> => {
  const data = await redis.get("user:1");
  if (data) {
    console.log("Данные из Redis:", JSON.parse(data));
  } else {
    console.log("Данные не найдены");
  }
};

// Запуск теста
const testRedis = async (): Promise<void> => {
  await setKey();
  await getKey();
  redis.disconnect(); // Закрываем соединение
};

testRedis();
