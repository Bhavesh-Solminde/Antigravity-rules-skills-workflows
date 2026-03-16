import mongoose from 'mongoose';
import { ENV } from '../../env';

export const connectDB = async (): Promise<void> => {
  const conn = await mongoose.connect(ENV.MONGO_URI);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};
