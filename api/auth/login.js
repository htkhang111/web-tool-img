// api/auth/login.js
import { connectDB } from '../utils/db.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String,
    keys: Array
}));

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        await connectDB();
        const { username, password } = JSON.parse(req.body);

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu!' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu!' });

        // Trả về thông tin user (trừ password)
        res.status(200).json({ 
            username: user.username, 
            keys: user.keys 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}