// api/utils/db.js
import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
    if (isConnected) return;

    if (!process.env.MONGODB_URI) {
        throw new Error("Chưa cấu hình biến MONGODB_URI trong Vercel!");
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'studio_pro_db', // Tên DB 
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log("MongoDB Connected!");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
        throw error;
    }
};