import mongoose from 'mongoose';

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(uri);
    console.log('Successfully connected to MongoDB 👍');
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1); // Exit the process if connection fails
  }
};

export default connectDB;
