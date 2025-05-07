import express from 'express';
import cors from 'cors';
import factoryRouter from './routes/factoryRoutes';
import doctorRouter from './routes/doctorRoutes';
import clinicRouter from './routes/clinicRoutes';
import transactionRouter from './routes/transactionRoutes';
import { connectToMongoDB } from './config/dbMongo';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/doctor', doctorRouter);
app.use('/clinic', clinicRouter);
app.use('/factory', factoryRouter);
app.use('/transaction', transactionRouter);

connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB', error);
});