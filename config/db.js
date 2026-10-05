import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vishwajeet_portfolio';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Error (${uri}): ${error.message}`);
    console.warn(`ℹ️ The backend will continue running. Ensure MongoDB is running on ${uri} for persistence.`);
    return false;
  }
};

export default connectDB;
