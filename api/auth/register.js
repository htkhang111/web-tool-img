// api/auth/register.js
import { connectDB } from '../utils/db.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Định nghĩa Schema User ngay tại đây cho gọn
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    keys: { type: Array, default: [] }, // Chứa API Keys
    createdAt: { type: Date, default: Date.now }
});

// Tránh lỗi compile lại Model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await connectDB();
        const { username, password } = JSON.parse(req.body);

        if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin!' });

        // Check user tồn tại
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: 'Tên tài khoản đã tồn tại!' });

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}