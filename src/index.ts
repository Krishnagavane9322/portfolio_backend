import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { router } from './routes';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

app.get('/health', (_req, res) => {
  const state = mongoose.connection.readyState;
  res.json({ ok: true, dbState: state });
});

async function start() {
  const port = Number(process.env.PORT) || 4000;
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }

  app.use('/api', router);

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

start().catch((e) => console.error('Failed to start server', e));
