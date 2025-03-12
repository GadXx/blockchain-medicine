import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import registerRoutes from "./routes/register.js";
import routerWallet from "./routes/wallet.js";
import router from "./routes/block.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api", registerRoutes);
app.use("/api", routerWallet);
app.use("/api", router)

app.listen(port, () => {
  console.log(`✅ Сервер запущен на http://localhost:${port}`);
});
