// api/user/keys.js
import { connectDB } from '../utils/db.js';
import mongoose from 'mongoose';

// Định nghĩa lại Schema User (để tránh lỗi model chưa đăng ký)
const UserSchema = new mongoose.Schema({
    username: String,
    keys: Array
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default async function handler(req, res) {
    // Chỉ chấp nhận POST (Thêm) và DELETE (Xóa)
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        await connectDB();
        const { username, keyItem, keyId } = JSON.parse(req.body);

        if (!username) return res.status(400).json({ error: 'Thiếu thông tin User!' });

        const user = await User.findOne({ username });
        if (!user) return res.status(404).json({ error: 'User không tồn tại!' });

        if (req.method === 'POST') {
            // --- THÊM KEY MỚI ---
            // Kiểm tra xem key này đã active chưa, nếu có thì tắt active các key cùng loại cũ
            if (keyItem.active) {
                user.keys.forEach(k => {
                    if (k.provider === keyItem.provider) k.active = false;
                });
            }
            // Thêm key mới vào mảng
            user.keys.push(keyItem);
            await user.save();
            return res.status(200).json({ message: 'Đã lưu Key vào DB!', keys: user.keys });
        } 
        
        if (req.method === 'DELETE') {
            // --- XÓA KEY ---
            user.keys = user.keys.filter(k => k.id !== keyId);
            await user.save();
            return res.status(200).json({ message: 'Đã xóa Key!', keys: user.keys });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}