// api/auth/login.js
import { supabase } from '../utils/db.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { username, password } = JSON.parse(req.body);

        // 1. Tìm user trong bảng users
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        // Nếu lỗi hoặc không tìm thấy user
        if (error || !user) return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu!' });

        // 2. So khớp mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Sai tài khoản hoặc mật khẩu!' });

        // 3. Trả về thông tin (Supabase tự parse JSONB 'keys' thành array rồi)
        res.status(200).json({ 
            username: user.username, 
            keys: user.keys || [] 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}