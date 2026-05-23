import mongoose from 'mongoose';

/**
 * Connects to MongoDB using MONGO_URI env variable.
 * Safe for connection reuse and registers database event hooks.
 */
export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌ Database configuration failure: MONGO_URI env variable is missing.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`🔌 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Register active listeners for post-connection runtime issues
    mongoose.connection.on('error', (err) => {
      console.error('⚠️ Database connection error occurred:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Database connection lost. Reconnecting...');
    });
  } catch (error) {
    console.error('❌ Could not establish database connection:', error);
    process.exit(1);
  }
};
