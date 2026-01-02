// api/user/keys.js
import { supabase } from '../utils/db.js';

export default async function handler(req, res) {
    // Chỉ chấp nhận POST (Thêm) và DELETE (Xóa)
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, keyItem, keyId } = JSON.parse(req.body);

        if (!username) return res.status(400).json({ error: 'Thiếu thông tin User!' });

        // 1. Lấy user và mảng keys hiện tại
        const { data: user, error } = await supabase
            .from('users')
            .select('keys')
            .eq('username', username)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User không tồn tại!' });

        let currentKeys = user.keys || [];

        // --- LOGIC THÊM KEY ---
        if (req.method === 'POST') {
            if (keyItem.active) {
                // Tắt active các key cùng loại cũ
                currentKeys = currentKeys.map(k => {
                    if (k.provider === keyItem.provider) k.active = false;
                    return k;
                });
            }
            currentKeys.push(keyItem);
        } 
        
        // --- LOGIC XÓA KEY ---
        if (req.method === 'DELETE') {
            currentKeys = currentKeys.filter(k => k.id !== keyId);
        }

        // 2. Update ngược lại vào Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ keys: currentKeys })
            .eq('username', username);

        if (updateError) throw updateError;

        return res.status(200).json({ message: 'Thành công!', keys: currentKeys });

    } catch (error) {
        console.error("Key API Error:", error);
        return res.status(500).json({ error: error.message });
    }
}