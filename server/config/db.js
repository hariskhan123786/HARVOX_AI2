import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

class DatabaseManager {
  constructor() {
    this.uri = process.env.MONGODB_URI;
    this.retryInterval = 5000; // Initial delay of 5s
    this.maxRetries = 5;
    this.retryCount = 0;
    this.isConnected = false;
  }

  async connect() {
    if (this.isConnected) return;

    const options = {
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    };

    // Use in-memory MongoDB for development / demo
    if (process.env.USE_IN_MEMORY_DB === 'true') {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        const inMemoryUri = mongod.getUri();
        console.log('Using in-memory MongoDB (dev/demo):', inMemoryUri);
        
        await mongoose.connect(inMemoryUri, options);
        this.isConnected = true;
        console.log('Successfully connected to in-memory MongoDB.');
        return;
      } catch (err) {
        console.error('Failed to start in-memory MongoDB:', err.message);
        throw err;
      }
    }

    if (!this.uri) {
      console.error('MONGODB_URI is not defined in environment variables.');
      process.exit(1);
    }

    mongoose.connection.on('connected', () => {
      console.log('MongoDB successfully connected to database cluster.');
      this.isConnected = true;
      this.retryCount = 0;
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
      this.isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected.');
      this.isConnected = false;
      this.handleReconnect();
    });

    try {
      console.log('Connecting to MongoDB database cluster...');
      await mongoose.connect(this.uri, options);
    } catch (err) {
      console.error(`Failed to connect to MongoDB on initial attempt: ${err.message}`);
      this.handleReconnect();
    }
  }

  async handleReconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error(`MongoDB reconnection failed after ${this.maxRetries} attempts. Stopping retry.`);
      return;
    }

    this.retryCount += 1;
    const delay = this.retryInterval * Math.pow(2, this.retryCount - 1);
    console.log(`Scheduling MongoDB reconnection attempt ${this.retryCount}/${this.maxRetries} in ${delay}ms...`);
    
    setTimeout(async () => {
      try {
        await mongoose.connect(this.uri, {
          maxPoolSize: 10,
          socketTimeoutMS: 45000,
          serverSelectionTimeoutMS: 5000,
          heartbeatFrequencyMS: 10000,
        });
      } catch (err) {
        console.error(`Reconnection attempt ${this.retryCount} failed: ${err.message}`);
      }
    }, delay);
  }

  getHealth() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    const readyState = mongoose.connection.readyState;
    return {
      status: readyState === 1 ? 'ok' : 'degraded',
      state: states[readyState] || 'unknown',
      details: {
        readyState,
        poolSize: mongoose.connection.getClient()?.options?.maxPoolSize || 10,
        host: mongoose.connection.host || 'unknown',
        dbName: mongoose.connection.name || 'unknown',
      }
    };
  }
}

const dbManager = new DatabaseManager();

export const connectDB = async () => {
  await dbManager.connect();
};

export const getDBHealth = () => {
  return dbManager.getHealth();
};

