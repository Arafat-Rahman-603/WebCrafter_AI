import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("[DB] ⚠ MONGODB_URI is not defined in environment variables");
            return;
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("[DB] MongoDB connection error:", error.message);
    }
}

export default connectDB;
