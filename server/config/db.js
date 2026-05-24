import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
  // Use in-memory MongoDB for development / demo
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    console.log('Using in-memory MongoDB:', uri);
    await mongoose.connect(uri);
    return;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/harvox-ai';
  await mongoose.connect(uri);
};
