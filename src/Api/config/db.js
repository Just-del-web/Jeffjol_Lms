import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`---`);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log(`---`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    process.exit(1);
  }
};

export default connectDB;