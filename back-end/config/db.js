// config/db.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: process.env.NODE_ENV,
      family: 4,
      tls: true, //  تفعيل TLS لـ Atlas
      retryWrites: true,
      w: "majority",
    });
  } catch (err) {
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
