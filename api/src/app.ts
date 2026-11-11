import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import didRouter from './routes/didRoutes';
import factoryRouter from './routes/factoryRoutes';
import medicalCardRouter from './routes/medicalCardRoutes';
import transactionRouter from './routes/transactionRoutes';
import { connectToMongoDB } from './config/dbMongo';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);
app.use('/did', didRouter);
app.use('/factory', factoryRouter);
app.use('/medical-card', medicalCardRouter);
app.use('/transaction', transactionRouter);


connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB', error);
});
