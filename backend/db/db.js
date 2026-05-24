import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let isConnected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.error(
        "[DB] ⚠ MONGODB_URI is not defined in environment variables",
      );
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "WebCrafterAI",
    });

    isConnected = true;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("[DB] MongoDB connection error:", error.message);
    // Throw error so the caller knows connection failed
    throw error;
  }
};

export default connectDB;
