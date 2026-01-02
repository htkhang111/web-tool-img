// api/auth/register.js
import { supabase } from '../utils/db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { username, password } = JSON.parse(req.body);

        if (!username || !password) return res.status(400).json({ error: 'Thiếu thông tin!' });

        // 1. Check user tồn tại
        const { data: existingUser } = await supabase
            .from('users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) return res.status(400).json({ error: 'Tên tài khoản đã tồn tại!' });

        // 2. Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert vào Supabase
        const { error } = await supabase
            .from('users')
            .insert([
                { username, password: hashedPassword, keys: [] }
            ]);

        if (error) throw error;

        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi Server: ' + error.message });
    }
}