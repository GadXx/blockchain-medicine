import { Redis } from "ioredis";

export const redis = new Redis({
    host: "localhost", 
    port: 6379, 
    db: 0
});

redis.on("error", (err) => console.error("❌ Ошибка Redis:", err));
  